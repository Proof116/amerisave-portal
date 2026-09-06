import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Application = {
  id: string;
  loan_type: "home" | "personal";
  status: "draft" | "submitted" | "under_review" | "approved" | "declined";
  answers: Record<string, string>;
  created_at: string;
};

const answerLabels: Record<string, string> = {
  purpose: "Purpose",
  state: "Property State",
  homeValue: "Estimated Home Value",
  loanAmount: "Requested Loan Amount",
  employment: "Employment",
  incomeRange: "Annual Income Range",
};

export default async function SubmitApplicationPage({
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
      "id, loan_type, status, answers, created_at"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !application) {
    notFound();
  }

  const typedApplication = application as Application;

  if (typedApplication.status !== "draft") {
    redirect(`/applications/${typedApplication.id}`);
  }

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
            AMERISAVE
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
            Final Review
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Review before submitting
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-[#687386]">
            Please review the information below carefully. Once
            submitted, this application will move into the
            submitted stage.
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

        {/* Important Notice */}
        <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="font-semibold text-blue-900">
            Before you submit
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            Submitting this application indicates that the
            information provided in this development application
            is ready for review. In a production lending system,
            additional disclosures, consent language, identity
            verification, and required financial documentation
            would be presented here.
          </p>
        </section>

        {/* Submit Form */}
        <form
          action="/api/applications/submit"
          method="POST"
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

        <p className="mt-4 text-center text-xs leading-5 text-[#687386]">
          Development environment — this submission updates the
          application status in the Supabase database.
        </p>
      </div>
    </main>
  );
}