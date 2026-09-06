import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");

    return NextResponse.json(
      { error: "Webhook configuration error" },
      { status: 500 }
    );
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error
    );

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  console.log("STRIPE WEBHOOK RECEIVED:", event.type, event.id);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("CHECKOUT COMPLETED:", session.id);

        const paymentId = session.metadata?.payment_id;
        const applicationId = session.metadata?.application_id;
        const userId = session.metadata?.user_id;

        if (!paymentId || !applicationId || !userId) {
          console.error(
            "Checkout session is missing required metadata:",
            session.id
          );

          break;
        }

        // Only treat a Checkout Session as paid when Stripe
        // reports that payment was actually received.
        if (session.payment_status !== "paid") {
          console.warn(
            "Checkout session completed without paid status:",
            {
              sessionId: session.id,
              paymentStatus: session.payment_status,
            }
          );

          break;
        }

        const supabase = createAdminClient();

        // Find the exact payment record and verify that the
        // Stripe session belongs to the same application/user.
        const { data: payment, error: paymentLookupError } =
          await supabase
            .from("loan_payments")
            .select(
              "id, user_id, application_id, status, stripe_checkout_session_id"
            )
            .eq("id", paymentId)
            .maybeSingle();

        if (paymentLookupError) {
          console.error(
            "Failed to look up loan payment:",
            paymentLookupError
          );

          return NextResponse.json(
            { error: "Unable to process webhook" },
            { status: 500 }
          );
        }

        if (!payment) {
          console.error(
            "Loan payment not found for Stripe session:",
            {
              paymentId,
              sessionId: session.id,
            }
          );

          break;
        }

        // Verify Stripe metadata matches the database record.
        if (
          payment.user_id !== userId ||
          payment.application_id !== applicationId
        ) {
          console.error(
            "Stripe metadata does not match loan payment:",
            {
              paymentId,
              sessionId: session.id,
            }
          );

          break;
        }

        // If a payment already succeeded, this is safely
        // idempotent. Do not rewrite paid_at.
        if (payment.status === "succeeded") {
          console.log(
            "LOAN PAYMENT ALREADY SUCCEEDED:",
            paymentId
          );

          break;
        }

        // Verify that the Checkout Session recorded in our
        // database matches the session Stripe is reporting.
        if (
          payment.stripe_checkout_session_id &&
          payment.stripe_checkout_session_id !== session.id
        ) {
          console.error(
            "Stripe Checkout session does not match payment record:",
            {
              paymentId,
              storedSessionId:
                payment.stripe_checkout_session_id,
              receivedSessionId: session.id,
            }
          );

          break;
        }

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null;

        const now = new Date().toISOString();

        const { error: updateError } = await supabase
          .from("loan_payments")
          .update({
            status: "succeeded",
            stripe_payment_intent_id: paymentIntentId,
            paid_at: now,
            updated_at: now,
          })
          .eq("id", paymentId)
          .neq("status", "succeeded");

        if (updateError) {
          console.error(
            "Failed to update loan payment:",
            updateError
          );

          return NextResponse.json(
            { error: "Unable to process webhook" },
            { status: 500 }
          );
        }

        console.log(
          "LOAN PAYMENT MARKED SUCCEEDED:",
          paymentId
        );

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent =
          event.data.object as Stripe.PaymentIntent;

        console.log(
          "PAYMENT SUCCEEDED:",
          paymentIntent.id
        );

        // The Checkout Session event is the authoritative
        // state transition for this payment flow.
        // We intentionally do not independently modify
        // loan_payments here.
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent =
          event.data.object as Stripe.PaymentIntent;

        console.log(
          "PAYMENT FAILED:",
          paymentIntent.id
        );

        // No successful payment state is written here.
        break;
      }

      default:
        console.log(
          "Unhandled Stripe event:",
          event.type
        );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      "Stripe webhook processing error:",
      error
    );

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}