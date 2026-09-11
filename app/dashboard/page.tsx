import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "declined";

type Application = {
  id: string;
  loan_type: "home" | "personal";
  status: ApplicationStatus;
  created_at: string;
};

type LoanAccount = {
  id: string;
  loan_type: "home" | "personal";
  status: "active" | "paid_off" | "closed";
  balance: number;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: applications } = await supabase
    .from("loan_applications")
    .select("id, loan_type, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: loanAccounts } = await supabase
    .from("loan_accounts")
    .select("id, loan_type, status, balance")
    .eq("user_id", user.id)
    .eq("status", "active");

  const typedApplications =
    (applications as Application[] | null) || [];

  const typedLoanAccounts =
    (loanAccounts as LoanAccount[] | null) || [];

  const homeLoanBalance = typedLoanAccounts
    .filter((loan) => loan.loan_type === "home")
    .reduce((total, loan) => total + Number(loan.balance || 0), 0);

  const personalLoanBalance = typedLoanAccounts
    .filter((loan) => loan.loan_type === "personal")
    .reduce((total, loan) => total + Number(loan.balance || 0), 0);

  const totalLoanBalance =
    homeLoanBalance + personalLoanBalance;

  const firstName = profile?.first_name || "there";

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#172033]">
      {/* Header */}
      <header className="border-b border-[#dfe4ec] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-[#1769e0]"
          >
            GetSaved
          </Link>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe4ec] bg-white transition hover:bg-[#f5f7fa]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#1769e0]" />
            </button>

            {/* Profile */}
            <Link
              href="/profile"
              aria-label="Open profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1769e0] text-sm font-bold text-white transition hover:bg-[#0f56c7]"
            >
              {firstName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-5 py-8 md:py-10">
        {/* Welcome */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-[#687386]">
            Account Overview
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Welcome back, {firstName}
          </h1>

          <p className="mt-2 text-[#687386]">{user.email}</p>
        </section>

        {/* Financial Summary */}
        <section className="grid gap-5 md:grid-cols-3">
          <SummaryCard
            title="Total Loan Balance"
            value={formatCurrency(totalLoanBalance)}
            description={
              typedLoanAccounts.length > 0
                ? "Across active loan accounts"
                : "No active loan accounts"
            }
          />

          <SummaryCard
            title="Home Loan Balance"
            value={formatCurrency(homeLoanBalance)}
            description={
              homeLoanBalance > 0
                ? "Active home loan balance"
                : "No active home loan"
            }
          />

          <SummaryCard
            title="Personal Loan Balance"
            value={formatCurrency(personalLoanBalance)}
            description={
              personalLoanBalance > 0
                ? "Active personal loan balance"
                : "No active personal loan"
            }
          />
        </section>

        {/* Loans */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Your Loans</h2>

            <p className="mt-1 text-sm text-[#687386]">
              Manage your financing applications and loan
              accounts.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <LoanCard
              title="Home Loan"
              subtitle="Mortgage & home financing"
              description="Buy a home, refinance, or explore home equity options."
              href="/apply?loanType=home"
            />

            <LoanCard
              title="Personal Loan"
              subtitle="Personal financing"
              description="Explore financing for personal expenses and major purchases."
              href="/apply?loanType=personal"
            />
          </div>
        </section>

        {/* My Applications */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                My Applications
              </h2>

              <p className="mt-1 text-sm text-[#687386]">
                Track the progress of your loan applications.
              </p>
            </div>

            {typedApplications.length > 0 && (
              <span className="text-sm font-medium text-[#687386]">
                {typedApplications.length}{" "}
                {typedApplications.length === 1
                  ? "application"
                  : "applications"}
              </span>
            )}
          </div>

          {typedApplications.length === 0 ? (
            <div className="rounded-2xl border border-[#dfe4ec] bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf2ff] text-xl">
                +
              </div>

              <h3 className="mt-5 text-lg font-bold">
                No applications yet
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#687386]">
                Start a home loan or personal loan application
                and it will appear here automatically.
              </p>

              <Link
                href="/apply"
                className="mt-5 inline-flex rounded-xl bg-[#1769e0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f56c7]"
              >
                Start an Application
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {typedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  id={application.id}
                  loanType={application.loan_type}
                  status={application.status}
                  createdAt={application.created_at}
                />
              ))}
            </div>
          )}
        </section>

        {/* Application Center */}
        <section className="mt-10 rounded-2xl border border-[#dfe4ec] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#1769e0]">
                Application Center
              </div>

              <h2 className="text-xl font-bold">
                Start a new loan application
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687386]">
                Choose a home loan or personal loan to begin a
                new application.
              </p>
            </div>

            <Link
              href="/apply"
              className="rounded-xl bg-[#1769e0] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#0f56c7]"
            >
              Start Application
            </Link>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-bold">
            Quick Actions
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              title="Profile"
              description="Manage your account"
              href="/profile"
            />

            <QuickAction
              title="Home Loans"
              description="Explore home financing"
              href="/apply?loanType=home"
            />

            <QuickAction
              title="Personal Loans"
              description="Explore personal financing"
              href="/apply?loanType=personal"
            />

            <QuickAction
              title="Help Center"
              description="Get assistance"
              href="/profile"
            />
          </div>
        </section>

        {/* Loan Servicing Status */}
<section className="mt-10 rounded-2xl border border-[#dfe4ec] bg-white p-6 shadow-sm">
  <h2 className="text-lg font-bold text-[#172033]">
    Loan Servicing
  </h2>

  <p className="mt-2 text-sm leading-6 text-[#687386]">
    {typedLoanAccounts.length > 0
      ? "Your active loan account information and current balances are shown above."
      : "Loan account balances and servicing information will appear here when an active loan account is established."}
  </p>
</section>

        {/* Sign Out */}
        <form
          action="/auth/signout"
          method="post"
          className="mt-8 flex justify-end"
        >
          <button
            type="submit"
            className="text-sm font-medium text-[#687386] transition hover:text-[#c93636]"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}

/* ---------------- Helpers ---------------- */

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/* ---------------- Components ---------------- */

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dfe4ec] bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-[#687386]">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#687386]">
        {description}
      </p>
    </div>
  );
}

function LoanCard({
  title,
  subtitle,
  description,
  href,
}: {
  title: string;
  subtitle: string;
  description: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dfe4ec] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xl font-bold">{title}</p>

      <p className="mt-1 text-sm text-[#687386]">
        {subtitle}
      </p>

      <p className="mt-6 text-sm leading-6 text-[#687386]">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 block w-full rounded-xl border border-[#1769e0] px-4 py-3 text-center text-sm font-semibold text-[#1769e0] transition hover:bg-[#1769e0] hover:text-white"
      >
        Get Started
      </Link>
    </div>
  );
}

function ApplicationCard({
  id,
  loanType,
  status,
  createdAt,
}: {
  id: string;
  loanType: "home" | "personal";
  status: ApplicationStatus;
  createdAt: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dfe4ec] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ff] text-xl">
            {loanType === "home" ? "🏠" : "💳"}
          </div>

          <div>
            <p className="font-bold">
              {loanType === "home"
                ? "Home Loan Application"
                : "Personal Loan Application"}
            </p>

            <p className="mt-1 text-sm text-[#687386]">
              Application #{id.slice(0, 8).toUpperCase()}
            </p>

            <p className="mt-1 text-xs text-[#687386]">
              Created {formatDate(createdAt)}
            </p>
          </div>
        </div>

        {(() => {
          const statusInfo = getStatusInfo(status);

          return (
            <div>
              <span className="font-semibold">
                {statusInfo.label}
              </span>

              <p className="text-sm text-gray-500">
                {statusInfo.description}
              </p>
            </div>
          );
        })()}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#edf0f4] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <ApplicationProgress status={status} />

        <Link
          href={`/applications/${id}`}
          className="rounded-xl border border-[#1769e0] px-4 py-2.5 text-center text-sm font-semibold text-[#1769e0] transition hover:bg-[#1769e0] hover:text-white"
        >
          View Application
        </Link>
      </div>
    </div>
  );
}

function getStatusInfo(status: string) {
  switch (status) {
    case "draft":
      return {
        label: "Draft",
        description: "Application in progress",
      };

    case "submitted":
      return {
        label: "Submitted",
        description: "Application received",
      };

    case "under_review":
      return {
        label: "Under Review",
        description: "Application is being reviewed",
      };

    case "approved":
      return {
        label: "Approved",
        description: "Application approved",
      };

    case "declined":
      return {
        label: "Declined",
        description: "Application was not approved",
      };

    default:
      return {
        label: "Unknown",
        description: "Status unavailable",
      };
  }
}

function ApplicationProgress({
  status,
}: {
  status: ApplicationStatus;
}) {
  if (status === "declined") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-red-700">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50">
          !
        </span>
        Application declined
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-green-700">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50">
          ✓
        </span>
        Application approved
      </div>
    );
  }

  const steps = [
    {
      key: "draft",
      label: "Draft",
    },
    {
      key: "submitted",
      label: "Submitted",
    },
    {
      key: "under_review",
      label: "Under Review",
    },
  ];

  const currentIndex = steps.findIndex(
    (step) => step.key === status
  );

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-[#687386]">
      {steps.map((step, index) => {
        const active = index <= currentIndex;

        return (
          <div
            key={step.key}
            className="flex items-center gap-2"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                active
                  ? "bg-[#1769e0] text-white"
                  : "bg-[#edf0f4] text-[#687386]"
              }`}
            >
              {index + 1}
            </span>

            <span className="hidden sm:inline">
              {step.label}
            </span>

            {index < steps.length - 1 && (
              <span className="mx-1 h-px w-4 bg-[#dfe4ec]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function QuickAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[#dfe4ec] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#1769e0] hover:shadow-md"
    >
      <p className="font-semibold">{title}</p>

      <p className="mt-1 text-sm text-[#687386]">
        {description}
      </p>
    </Link>
  );
}