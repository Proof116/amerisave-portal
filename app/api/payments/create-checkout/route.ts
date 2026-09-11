import { NextResponse } from "next/server";

import { calculateProcessingFee } from "@/lib/lending/fees";
import {
  PERSONAL_LOAN_PROCESSING_FEE_RULES,
} from "@/lib/lending/fee-rules";
import { parseLoanAmount } from "@/lib/lending/amounts";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid payment request." },
        { status: 400 }
      );
    }

    const applicationId = body.applicationId;

    if (
      typeof applicationId !== "string" ||
      !applicationId.trim()
    ) {
      return NextResponse.json(
        { error: "Application ID is required." },
        { status: 400 }
      );
    }

    const trimmedApplicationId = applicationId.trim();

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(trimmedApplicationId)) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 }
      );
    }

    // Load the application belonging to the authenticated user.
    const { data: application, error: applicationError } =
      await supabase
        .from("loan_applications")
        .select("id, user_id, loan_type, status, answers")
        .eq("id", trimmedApplicationId)
        .eq("user_id", user.id)
        .single();

    if (applicationError || !application) {
      return NextResponse.json(
        { error: "Loan application not found." },
        { status: 404 }
      );
    }

    // Payment is only allowed after an actual approval.
    if (application.status !== "approved") {
      return NextResponse.json(
        {
          error:
            "This application is not approved for payment processing.",
        },
        { status: 400 }
      );
    }

    // Currently, processing-fee rules apply to personal loans.
    if (application.loan_type !== "personal") {
      return NextResponse.json(
        {
          error:
            "A processing fee is not currently configured for this loan type.",
        },
        { status: 400 }
      );
    }

    const answers =
      application.answers &&
      typeof application.answers === "object" &&
      !Array.isArray(application.answers)
        ? (application.answers as Record<string, unknown>)
        : {};

    // The loan amount must come from the saved application,
    // never from the payment request supplied by the browser.
    let loanAmount: number;

    try {
      loanAmount = parseLoanAmount(answers.loanAmount);
    } catch {
      return NextResponse.json(
        {
          error:
            "The approved application does not contain a valid loan amount.",
        },
        { status: 400 }
      );
    }

    let feeAmount: number;

    try {
      const fee = calculateProcessingFee(
        loanAmount,
        PERSONAL_LOAN_PROCESSING_FEE_RULES
      );

      feeAmount = fee.feeAmount;
    } catch {
      return NextResponse.json(
        {
          error:
            "No processing fee rule applies to this loan amount.",
        },
        { status: 400 }
      );
    }

    // Read payment records through the trusted server client.
    const { data: successfulPayment } = await adminSupabase
      .from("loan_payments")
      .select("id")
      .eq("application_id", application.id)
      .eq("user_id", user.id)
      .eq("status", "succeeded")
      .limit(1)
      .maybeSingle();

    if (successfulPayment) {
      return NextResponse.json(
        {
          error: "The processing fee has already been paid.",
        },
        { status: 400 }
      );
    }

    // Reuse an existing pending/processing payment when possible.
    const { data: existingPayment } = await adminSupabase
      .from("loan_payments")
      .select(
        "id, amount, stripe_checkout_session_id, status"
      )
      .eq("application_id", application.id)
      .eq("user_id", user.id)
      .eq("purpose", "processing_fee")
      .in("status", ["pending", "processing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      existingPayment?.stripe_checkout_session_id &&
      (existingPayment.status === "pending" ||
        existingPayment.status === "processing") &&
      Number(existingPayment.amount) === feeAmount
    ) {
      try {
        const existingSession =
          await stripe.checkout.sessions.retrieve(
            existingPayment.stripe_checkout_session_id
          );

        if (
          existingSession.status === "open" &&
          existingSession.url
        ) {
          return NextResponse.json({
            checkoutUrl: existingSession.url,
            feeAmount,
          });
        }
      } catch (stripeError) {
        console.error(
          "Unable to reuse existing Stripe checkout session:",
          stripeError
        );
      }
    }

    let paymentId = existingPayment?.id;

    // Create the payment record through the trusted server client.
    if (!paymentId) {
      const { data: payment, error: paymentError } =
        await adminSupabase
          .from("loan_payments")
          .insert({
            user_id: user.id,
            application_id: application.id,
            purpose: "processing_fee",
            amount: feeAmount,
            currency: "usd",
            status: "pending",
          })
          .select("id")
          .single();

      if (paymentError || !payment) {
        console.error(
          "Payment record creation failed:",
          paymentError
        );

        return NextResponse.json(
          { error: "Unable to create payment record." },
          { status: 500 }
        );
      }

      paymentId = payment.id;
    } else if (
      Number(existingPayment?.amount) !== feeAmount
    ) {
      // Keep the payment record synchronized with the
      // authoritative server-side fee calculation.
      const { error: updateAmountError } =
        await adminSupabase
          .from("loan_payments")
          .update({
            amount: feeAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentId)
          .eq("application_id", application.id)
          .eq("user_id", user.id);

      if (updateAmountError) {
        console.error(
          "Payment amount update failed:",
          updateAmountError
        );

        return NextResponse.json(
          { error: "Unable to update payment amount." },
          { status: 500 }
        );
      }
    }

    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",

            product_data: {
              name: "Loan Processing Fee",
              description:
                "Processing fee associated with the approved loan application. Payment does not itself guarantee funding or create a funded loan balance.",
            },

            // Stripe expects cents.
            unit_amount: Math.round(feeAmount * 100),
          },

          quantity: 1,
        },
      ],

      metadata: {
        payment_id: paymentId,
        application_id: application.id,
        user_id: user.id,
      },

      success_url:
        `${origin}/applications/${application.id}?payment=success`,

      cancel_url:
        `${origin}/applications/${application.id}?payment=cancelled`,
    });

    const { error: updateError } =
      await adminSupabase
        .from("loan_payments")
        .update({
          stripe_checkout_session_id: session.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .eq("application_id", application.id)
        .eq("user_id", user.id);

    if (updateError) {
      console.error(
        "Payment Stripe session update failed:",
        updateError
      );

      return NextResponse.json(
        { error: "Unable to save Stripe payment session." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      feeAmount,
    });
  } catch (error) {
    console.error("Create checkout error:", error);

    return NextResponse.json(
      { error: "Unable to create payment session." },
      { status: 500 }
    );
  }
}