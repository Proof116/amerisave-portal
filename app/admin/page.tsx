import { getRecentAdminActivity } from "@/lib/admin/activity";
import AdminNav from "./AdminNav";
import Link from "next/link";
import {
  getAdminContext,
  getAdminDashboardStats,
} from "@/lib/admin/applications";

function getStatusInfo(status: string) {
  switch (status) {
    case "draft":
      return {
        label: "Draft",
        className: "bg-slate-100 text-slate-700",
      };

    case "submitted":
      return {
        label: "Submitted",
        className: "bg-blue-100 text-blue-700",
      };

    case "under_review":
      return {
        label: "Under Review",
        className: "bg-amber-100 text-amber-700",
      };

    case "approved":
      return {
        label: "Approved",
        className: "bg-green-100 text-green-700",
      };

    case "declined":
      return {
        label: "Declined",
        className: "bg-red-100 text-red-700",
      };

    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-700",
      };
  }
}

function getLoanType(type: string) {
  return type === "home"
    ? "Home Loan"
    : type === "personal"
      ? "Personal Loan"
      : type;
}

function getCustomerName(application: {
  first_name?: string | null;
  last_name?: string | null;
}) {
  const name = [application.first_name, application.last_name]
    .filter(Boolean)
    .join(" ");

  return name || "Unnamed Customer";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const { profile } = await getAdminContext();
  const { stats, recentApplications } = await getAdminDashboardStats();
  const activity = await getRecentAdminActivity();

  const adminName =
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ") || "Administrator";

  return (
    <>
      <AdminNav />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Administration
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {adminName}
              </h1>

              <p className="mt-2 text-slate-600">
                Here's what's happening across the application system.
              </p>
            </div>

            <Link
              href="/admin/applications"
              className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              View Applications
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Applications"
              value={stats.total}
              description="All applications"
            />

            <StatCard
              label="Submitted"
              value={stats.submitted}
              description="Awaiting review"
            />

            <StatCard
              label="Under Review"
              value={stats.underReview}
              description="Currently being reviewed"
            />

            <StatCard
              label="Approved"
              value={stats.approved}
              description="Approved applications"
            />
          </div>

<div className="mt-4">
  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
    <p className="text-sm font-medium text-blue-700">
      Total Loan Pipeline
    </p>

    <p className="mt-2 text-3xl font-bold tracking-tight text-blue-950">
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(stats.pipelineValue)}
    </p>

    <p className="mt-1 text-sm text-blue-700">
      Total requested loan amount across applications
    </p>
  </div>
</div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Declined"
              value={stats.declined}
              description="Not approved"
            />

            <StatCard
              label="Drafts"
              value={stats.draft}
              description="Not yet submitted"
            />

            <StatCard
              label="Home Loans"
              value={stats.homeLoans}
              description="Home applications"
            />

            <StatCard
              label="Personal Loans"
              value={stats.personalLoans}
              description="Personal applications"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Recent Applications
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    The latest activity in the system.
                  </p>
                </div>

                <Link
                  href="/admin/applications"
                  className="text-sm font-semibold text-blue-700 hover:underline"
                >
                  View all
                </Link>
              </div>

              {recentApplications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="font-medium text-slate-900">No applications yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Applications will appear here when customers apply.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentApplications.map((application) => {
                    const status = getStatusInfo(application.status);

                    return (
                      <div
                        key={application.id}
                        className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {getCustomerName(application)}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-500">
                            <span>{getLoanType(application.loan_type)}</span>
                            <span>•</span>
                            <span>{formatDate(application.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>

                          <Link
                            href={`/admin/applications/${application.id}`}
                            className="text-sm font-semibold text-blue-700 hover:underline"
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Common administrator tasks.
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/admin/applications"
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-4 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <span className="font-medium">Application Inbox</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/admin/applications?status=submitted"
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-4 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <span className="font-medium">Submitted Applications</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/admin/applications?status=under_review"
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-4 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <span className="font-medium">Applications Under Review</span>
                  <span>→</span>
                </Link>
              </div>
            </aside>
          </div>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Activity
              </h2>

              <p className="text-sm text-slate-500">
                Latest application events across the platform.
              </p>
            </div>

            {activity.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="divide-y divide-slate-100">
                  {activity.map((event) => {
                    const customerName =
                      [event.first_name, event.last_name]
                        .filter(Boolean)
                        .join(" ") || "Unknown Customer";

                    const eventTitle =
                      event.event_type === "application_created"
                        ? "Application Created"
                        : event.event_type === "status_changed"
                          ? "Application Status Changed"
                          : event.event_type
                              .replaceAll("_", " ")
                              .replace(/\b\w/g, (letter) =>
                                letter.toUpperCase()
                              );

                    return (
                      <div
                        key={event.id}
                        className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            •
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {eventTitle}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {customerName}
                              {event.loan_type ? ` · ${event.loan_type} loan` : ""}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Performed by:{" "}
                              {event.actor_first_name || event.actor_last_name
                                ? [
                                    event.actor_first_name,
                                    event.actor_last_name,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")
                                : event.actor_role === "admin"
                                  ? "Administrator"
                                  : "System"}
                            </p>

                            {event.event_type === "status_changed" &&
                            event.old_status &&
                            event.new_status ? (
                              <p className="mt-1 text-sm text-slate-500">
                                {event.old_status.replace("_", " ")}
                                {" → "}
                                {event.new_status.replace("_", " ")}
                              </p>
                            ) : event.description ? (
                              <p className="mt-1 text-sm text-slate-500">
                                {event.description}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="text-xs text-slate-400">
                            {new Date(event.created_at).toLocaleString()}
                          </p>

                          <a
                            href={`/admin/applications/${event.application_id}`}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                          >
                            View →
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <h3 className="font-semibold text-slate-900">No activity yet</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Application activity will appear here as customers create and update applications.
                </p>
              </div>
            )}
          </section>

          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                ✓
              </div>

              <div>
                <h2 className="font-semibold text-blue-950">
                  Admin System Online
                </h2>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Authentication, application data, customer profiles, and administrative access are connected through the secure server-side Admin Data Layer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}