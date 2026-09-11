import { NextResponse } from "next/server";

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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("ADMIN FUNDING PROFILE ERROR", {
        message: profileError.message,
        code: profileError.code,
      });

      return NextResponse.json(
        { error: "Unable to verify administrator access." },
        { status: 500 }
      );
    }

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const applicationId = String(
      formData.get("applicationId") ?? ""
    ).trim();

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(applicationId)) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 }
      );
    }

    const { data: application, error: applicationError } =
      await adminSupabase
        .from("loan_applications")
        .select(
          `
            id,
            user_id,
            loan_type,
            status,
            approved_loan_amount,
            approved_apr,
            approved_term_months,
            approved_monthly_payment,
            approved_total_repayment,
            approved_total_interest,
            approved_processing_fee,
            approved_at
          `
        )
        .eq("id", applicationId)
        .maybeSingle();

    if (applicationError) {
      console.error("ADMIN FUNDING APPLICATION ERROR", {
        message: applicationError.message,
        code: applicationError.code,
        applicationId,
      });

      return NextResponse.json(
        { error: "Unable to load the application." },
        { status: 500 }
      );
    }

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    if (application.status !== "approved") {
      return NextResponse.json(
        {
          error:
            "Only approved applications can be funded.",
        },
        { status: 400 }
      );
    }

    const principal = Number(application.approved_loan_amount);
    const apr = Number(application.approved_apr);
    const termMonths = Number(application.approved_term_months);
    const monthlyPayment = Number(
      application.approved_monthly_payment
    );
    const totalRepayment = Number(
      application.approved_total_repayment
    );
    const totalInterest = Number(
      application.approved_total_interest
    );
    const processingFee = Number(
      application.approved_processing_fee ?? 0
    );

    if (
      !Number.isFinite(principal) ||
      principal <= 0 ||
      !Number.isFinite(apr) ||
      apr < 0 ||
      !Number.isInteger(termMonths) ||
      termMonths <= 0 ||
      !Number.isFinite(monthlyPayment) ||
      monthlyPayment < 0 ||
      !Number.isFinite(totalRepayment) ||
      totalRepayment < 0 ||
      !Number.isFinite(totalInterest) ||
      totalInterest < 0
    ) {
      return NextResponse.json(
        {
          error:
            "The application does not contain complete valid approved loan terms.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(processingFee) ||
      processingFee < 0
    ) {
      return NextResponse.json(
        {
          error:
            "The approved processing fee is invalid.",
        },
        { status: 400 }
      );
    }

    /*
     * If the application has a processing fee, Stripe must have
     * confirmed that fee as successfully paid before funding.
     */
    if (processingFee > 0) {
      const { data: successfulPayment, error: paymentError } =
        await adminSupabase
          .from("loan_payments")
          .select("id, amount, currency, status, paid_at")
          .eq("application_id", application.id)
          .eq("user_id", application.user_id)
          .eq("purpose", "processing_fee")
          .eq("status", "succeeded")
          .order("paid_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (paymentError) {
        console.error("ADMIN FUNDING PAYMENT LOOKUP ERROR", {
          message: paymentError.message,
          code: paymentError.code,
          applicationId,
        });

        return NextResponse.json(
          { error: "Unable to verify the processing fee payment." },
          { status: 500 }
        );
      }

      if (!successfulPayment) {
        return NextResponse.json(
          {
            error:
              "The required processing fee has not been successfully paid through Stripe.",
          },
          { status: 400 }
        );
      }

      if (
        Number(successfulPayment.amount) !== processingFee ||
        String(successfulPayment.currency).toLowerCase() !== "usd"
      ) {
        return NextResponse.json(
          {
            error:
              "The recorded processing fee payment does not match the approved fee.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * Never create a second loan account for the same application.
     */
    const { data: existingLoan, error: existingLoanError } =
      await adminSupabase
        .from("loan_accounts")
        .select("id, status")
        .eq("application_id", application.id)
        .maybeSingle();

    if (existingLoanError) {
      console.error("ADMIN FUNDING EXISTING LOAN ERROR", {
        message: existingLoanError.message,
        code: existingLoanError.code,
        applicationId,
      });

      return NextResponse.json(
        { error: "Unable to check existing loan account." },
        { status: 500 }
      );
    }

    if (existingLoan) {
      return NextResponse.json(
        {
          error:
            "A loan account already exists for this application.",
        },
        { status: 400 }
      );
    }

    const fundedAt = new Date().toISOString();

    const { data: loanAccount, error: loanAccountError } =
      await adminSupabase
        .from("loan_accounts")
        .insert({
          user_id: application.user_id,
          application_id: application.id,
          loan_type: application.loan_type,
          status: "active",
          balance: principal,
          principal_amount: principal,
          apr,
          term_months: termMonths,
          monthly_payment: monthlyPayment,
          total_repayment: totalRepayment,
          total_interest: totalInterest,
          funded_at: fundedAt,
          updated_at: fundedAt,
        })
        .select(
          `
            id,
            user_id,
            application_id,
            loan_type,
            status,
            balance,
            principal_amount,
            apr,
            term_months,
            monthly_payment,
            total_repayment,
            total_interest,
            funded_at
          `
        )
        .single();

    if (loanAccountError || !loanAccount) {
      console.error("ADMIN FUNDING LOAN ACCOUNT ERROR", {
        message: loanAccountError?.message,
        code: loanAccountError?.code,
        details: loanAccountError?.details,
        applicationId,
      });

      return NextResponse.json(
        { error: "Unable to create the funded loan account." },
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      new URL(
        `/admin/applications/${application.id}?success=loan_funded`,
        request.url
      )
    );
  } catch (error) {
    console.error("ADMIN FUNDING UNHANDLED ERROR", {
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Unexpected funding error." },
      { status: 500 }
    );
  }
}