import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateLoanTerms } from "@/lib/lending/loan-terms";
import { calculateProcessingFee } from "@/lib/lending/fees";
import { PERSONAL_LOAN_PROCESSING_FEE_RULES } from "@/lib/lending/fee-rules";

const ALLOWED_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "declined",
] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(value: string): value is AllowedStatus {
  return ALLOWED_STATUSES.includes(value as AllowedStatus);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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
      console.error("ADMIN STATUS PROFILE ERROR", {
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

    const status = String(
      formData.get("status") ?? ""
    ).trim();

    if (!applicationId || !isAllowedStatus(status)) {
      return NextResponse.json(
        { error: "Invalid application status request." },
        { status: 400 }
      );
    }

    const { data: application, error: applicationError } =
      await supabase
        .from("loan_applications")
        .select(
          `
            id,
            user_id,
            loan_type,
            status,
            answers
          `
        )
        .eq("id", applicationId)
        .maybeSingle();

    if (applicationError) {
      console.error("ADMIN STATUS APPLICATION ERROR", {
        message: applicationError.message,
        code: applicationError.code,
      });

      return NextResponse.json(
        { error: "Unable to load application." },
        { status: 500 }
      );
    }

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    if (
      (status === "approved" || status === "declined") &&
      application.status !== "under_review"
    ) {
      return NextResponse.json(
        {
          error:
            "Final approval or decline requires the application to be under review.",
        },
        { status: 400 }
      );
    }

    /*
     * APPROVAL
     *
     * Approved terms are entered by the administrator, but all
     * repayment figures are calculated server-side.
     */
    if (status === "approved") {
      const approvedLoanAmount = Number(
        formData.get("approvedLoanAmount")
      );

      const approvedApr = Number(
        formData.get("approvedApr")
      );

      const approvedTermMonths = Number(
        formData.get("approvedTermMonths")
      );

      if (
        !Number.isFinite(approvedLoanAmount) ||
        approvedLoanAmount <= 0
      ) {
        return NextResponse.json(
          { error: "Approved loan amount must be greater than zero." },
          { status: 400 }
        );
      }

      if (
        !Number.isFinite(approvedApr) ||
        approvedApr < 0
      ) {
        return NextResponse.json(
          { error: "Approved APR must be zero or greater." },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(approvedTermMonths) ||
        approvedTermMonths <= 0
      ) {
        return NextResponse.json(
          { error: "Approved term must be a positive number of months." },
          { status: 400 }
        );
      }

      let terms;

      try {
        terms = calculateLoanTerms({
          principal: approvedLoanAmount,
          apr: approvedApr,
          termMonths: approvedTermMonths,
        });
      } catch (error) {
        console.error("ADMIN APPROVED TERMS CALCULATION ERROR", {
          applicationId,
          error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
          { error: "Unable to calculate approved loan terms." },
          { status: 400 }
        );
      }

      /*
       * Processing fees are product-specific.
       *
       * Personal loans currently have configured processing-fee rules.
       * Home loans do not automatically receive a processing fee here.
       */
      let processingFee = 0;

      if (application.loan_type === "personal") {
        processingFee = calculateProcessingFee(
          terms.principal,
          PERSONAL_LOAN_PROCESSING_FEE_RULES
        ).feeAmount;
      }

      const { error: updateError } = await supabase
        .from("loan_applications")
        .update({
          status: "approved",
          approved_loan_amount: terms.principal,
          approved_apr: terms.apr,
          approved_term_months: terms.termMonths,
          approved_monthly_payment: terms.monthlyPayment,
          approved_total_repayment: terms.totalRepayment,
          approved_total_interest: terms.totalInterest,
          approved_processing_fee: processingFee,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (updateError) {
        console.error("ADMIN APPROVAL UPDATE ERROR", {
          message: updateError.message,
          code: updateError.code,
          applicationId,
        });

        return NextResponse.json(
          { error: "Unable to save approved loan terms." },
          { status: 500 }
        );
      }

      return NextResponse.redirect(
        new URL(`/admin/applications/${applicationId}`, request.url)
      );
    }

    /*
     * Non-approval status changes.
     */
    const { error: updateError } = await supabase
      .from("loan_applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("ADMIN STATUS UPDATE ERROR", {
        message: updateError.message,
        code: updateError.code,
        applicationId,
      });

      return NextResponse.json(
        { error: "Unable to update application status." },
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      new URL(`/admin/applications/${applicationId}`, request.url)
    );
  } catch (error) {
    console.error("ADMIN APPLICATION STATUS UNHANDLED ERROR", {
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}