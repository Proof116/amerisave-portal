import PaymentButton from "./PaymentButton";

import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import DocumentUpload from "./DocumentUpload";

import {
  calculateProcessingFee,
} from "@/lib/lending/fees";

import {
  PERSONAL_LOAN_PROCESSING_FEE_RULES,
} from "@/lib/lending/fee-rules";

import { parseLoanAmount } from "@/lib/lending/amounts";

type Application = {
  id: string;
  loan_type: "home" | "personal";
  status: "draft" | "submitted" | "under_review" | "approved" | "declined";
  answers: Record<string, string>;
  created_at: string;
  approved_loan_amount: number | null;
  approved_apr: number | null;
  approved_term_months: number | null;
  approved_monthly_payment: number | null;
  approved_total_repayment: number | null;
  approved_total_interest: number | null;
  approved_processing_fee: number | null;
  approved_at: string | null;
};

const answerLabels: Record<string, string> = {
  purpose: "Purpose",
  state: "Property State",
  homeValue: "Estimated Home Value",
  loanAmount: "Requested Loan Amount",
  employment: "Employment",
  incomeRange: "Annual Income Range",
};

function getTimelineStep(status: string) {
  switch (status) {
    case "draft":
      return 1;

    case "submitted":
      return 2;

    case "under_review":
      return 3;

    case "approved":
    case "declined":
      return 4;

    default:
      return 1;
  }
}

export default async function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: application, error } = await supabase
    .from("loan_applications")
    .select(
      `
        id,
        loan_type,
        status,
        answers,
        created_at,
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
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !application) {
    notFound();
  }

  const { data: payment } = await supabase
    .from("loan_payments")
    .select(
      "id, amount, currency, status, paid_at, created_at"
    )
    .eq("application_id", application.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: documents } = await supabase
    .from("application_documents")
    .select(
      "id, document_type, file_name, file_size, status, rejection_reason, uploaded_at"
    )
    .eq("application_id", application.id)
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false });

  const typedApplication = application as Application;

let processingFeeAmount: number | undefined;

if (
  typedApplication.loan_type === "personal" &&
  typedApplication.status === "approved"
) {
  try {
    const loanAmount = parseLoanAmount(
      typedApplication.answers?.loanAmount
    );

    processingFeeAmount = calculateProcessingFee(
      loanAmount,
      PERSONAL_LOAN_PROCESSING_FEE_RULES
    ).feeAmount;
  } catch {
    processingFeeAmount = undefined;
  }
}

const currentTimelineStep = getTimelineStep(
  typedApplication.status
);

  const loanName =
    typedApplication.loan_type === "home"
      ? "Home Loan"
      : "Personal Loan";

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#172033]">
      {/* Header */}
      <header className="border-b border-[#dfe4ec] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-[#1769e0]"
          >
            GetSaved
          </Link>

          <Link
            href="/profile"
            className="text-sm font-medium text-[#687386] hover:text-[#1769e0]"
          >
            Profile
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href={`/applications/${typedApplication.id}`}
          className="text-sm font-medium text-[#687386] hover:text-[#1769e0]"
        >
          ← Back to Application
        </Link>

        <section className="mt-7 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#1769e0]">
  Application Details
</p>

<h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
  {typedApplication.status === "draft"
    ? "Review before submitting"
    : "Track your application"}
</h1>

      <p className="mx-auto mt-3 max-w-2xl text-[#687386]">
  {typedApplication.status === "draft"
    ? "Please review the information below carefully before submitting your application."
    : "View your application status, submitted information, documents, and payment activity."}
        </p>
        </section>

        {/* Application Type */}
        <section className="mt-8 rounded-2xl border border-[#dfe4ec] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf2ff] text-xl">
              {typedApplication.loan_type === "home"
                ? "🏠"
                : "💳"}
            </div>

            <div>
              <p className="text-sm text-[#687386]">
                Financing Type
              </p>

              <p className="text-xl font-bold">
                {loanName}
              </p>
            </div>
          </div>
        </section>

        {/* Application Progress */}
        <div className="mt-6 rounded-2xl border border-[#dfe4ec] bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#172033]">
              Application Progress
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Track your application from submission through final decision.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Application Started",
                description: "Your application has been created.",
              },
              {
                step: 2,
                title: "Application Submitted",
                description: "Your application has been submitted.",
              },
              {
                step: 3,
                title: "Under Review",
                description: "Your application is being reviewed.",
              },
              {
                step: 4,
                title:
                  typedApplication.status === "declined"
                    ? "Application Declined"
                    : "Decision",
                description:
                  typedApplication.status === "declined"
                    ? "A final decision has been recorded."
                    : typedApplication.status === "approved"
                      ? "Your application has been approved."
                      : "A final decision will appear here.",
              },
            ].map((item) => {
              const completed = currentTimelineStep >= item.step;
              const current = currentTimelineStep === item.step;

              return (
                <div key={item.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${
                        completed
                          ? "border-[#1769e0] bg-[#1769e0] text-white"
                          : "border-[#dfe4ec] bg-white text-gray-400"
                      }`}
                    >
                      {completed ? "✓" : item.step}
                    </div>

                    {item.step < 4 && (
                      <div
                        className={`mt-2 h-8 w-0.5 ${
                          currentTimelineStep > item.step
                            ? "bg-[#1769e0]"
                            : "bg-[#dfe4ec]"
                        }`}
                      />
                    )}
                  </div>

                  <div className="pb-2">
                    <h3
                      className={`font-semibold ${
                        current
                          ? "text-[#1769e0]"
                          : completed
                            ? "text-[#172033]"
                            : "text-gray-400"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {typedApplication.status === "approved" && (
  <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
    <h2 className="text-xl font-semibold text-blue-950">
      Application Approved
    </h2>

    <p className="mt-2 text-sm leading-6 text-blue-800">
      Your application has been approved. Review the approved loan terms
      below before proceeding with any applicable processing fee.
    </p>

    {typedApplication.approved_loan_amount !== null &&
      typedApplication.approved_apr !== null &&
      typedApplication.approved_term_months !== null &&
      typedApplication.approved_monthly_payment !== null &&
      typedApplication.approved_total_repayment !== null &&
      typedApplication.approved_total_interest !== null ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Approved Loan Amount
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-950">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(
                  Number(typedApplication.approved_loan_amount)
                )}
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                APR
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-950">
                {Number(typedApplication.approved_apr).toFixed(2)}%
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Loan Term
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-950">
                {typedApplication.approved_term_months} months
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Monthly Payment
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-950">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(
                  Number(typedApplication.approved_monthly_payment)
                )}
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total Interest
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-950">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(
                  Number(typedApplication.approved_total_interest)
                )}
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total Amount to Repay
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-950">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(
                  Number(typedApplication.approved_total_repayment)
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-blue-200 bg-white p-5">
            <p className="text-sm font-semibold text-gray-950">
              Processing Fee
            </p>

            {typedApplication.approved_processing_fee !== null ? (
              <p className="mt-1 text-2xl font-bold text-blue-700">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(
                  Number(typedApplication.approved_processing_fee)
                )}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-600">
                No processing fee has been configured for this loan.
              </p>
            )}

            <p className="mt-3 text-sm leading-6 text-gray-600">
              If a processing fee applies, it is separate from the loan
              principal. Clicking the payment button will take you to
              Stripe Checkout to authorize the payment. Payment of the
              processing fee does not by itself create a funded loan balance
              or guarantee disbursement.
            </p>
          </div>

          <div className="mt-6">
            <PaymentButton
              applicationId={typedApplication.id}
              paymentStatus={payment?.status}
              feeAmount={
                typedApplication.approved_processing_fee ?? undefined
              }
            />
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <p className="font-semibold text-yellow-900">
            Approved — terms pending
          </p>
          <p className="mt-1 text-sm leading-6 text-yellow-800">
            Your application has been approved, but the final loan terms
            have not yet been recorded. Please check back after the
            underwriting team completes the approval terms.
          </p>
        </div>
      )}
  </div>
)}

        {payment && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Status
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Processing fee:{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: payment.currency.toUpperCase(),
              }).format(Number(payment.amount))}
            </p>

            <p className="mt-3 text-sm font-medium">
              Status:{" "}
              <span className="capitalize">
                {payment.status.replace("_", " ")}
              </span>
            </p>

            {payment.paid_at && (
              <p className="mt-1 text-sm text-gray-500">
                Paid: {new Date(payment.paid_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Answers */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-[#dfe4ec] bg-white shadow-sm">
          <div className="border-b border-[#dfe4ec] px-6 py-5">
            <h2 className="text-lg font-bold">
              Your Information
            </h2>

            <p className="mt-1 text-sm text-[#687386]">
              Review the information you provided.
            </p>
          </div>

          <div className="divide-y divide-[#edf0f4]">
            {Object.entries(
              typedApplication.answers || {}
            ).map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-[#687386]">
                  {answerLabels[key] || key}
                </p>

                <p className="font-semibold sm:text-right">
                  {value || "Not provided"}
                </p>
              </div>
            ))}
          </div>
               </section>

        <DocumentUpload
          applicationId={typedApplication.id}
          initialDocuments={documents ?? []}
        />

        {typedApplication.status === "draft" ? (
          <>
            <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
              <h2 className="font-semibold text-blue-900">
                Before you submit
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Submitting this application indicates that the
                information provided is ready for review.
              </p>
            </section>

            <form
              action="/api/applications/submit"
              method="post"
              className="mt-6"
            >
              <input
                type="hidden"
                name="applicationId"
                value={typedApplication.id}
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-[#1769e0] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#0f56c7]"
              >
                Submit Application
              </button>
            </form>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-6 py-4 text-center text-sm font-semibold text-green-800">
            Application Submitted
          </div>
        )}
      </div>
    </main>
  );
}