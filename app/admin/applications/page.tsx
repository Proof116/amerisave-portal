import AdminNav from "../AdminNav";
import Link from "next/link";
import ApplicationFilters from "./ApplicationFilters";
import { getAllApplications } from "@/lib/admin/applications";

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

function formatLoanType(type: string) {
  return type === "home"
    ? "Home Loan"
    : type === "personal"
      ? "Personal Loan"
      : type;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getCustomerName(application: {
  first_name?: string | null;
  last_name?: string | null;
}) {
  const name = [
    application.first_name,
    application.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return name || "Unnamed Customer";
}

type Application = Awaited<
  ReturnType<typeof getAllApplications>
>[number];

function filterApplications(
  applications: Application[],
  search: string,
  status: string,
  type: string,
  sort: string
) {
  let results = [...applications];

  if (status) {
    results = results.filter(
      (application) =>
        application.status === status
    );
  }

  if (type) {
    results = results.filter(
      (application) =>
        application.loan_type === type
    );
  }

  if (search) {
    const query = search.toLowerCase();

    results = results.filter((application) => {
      const customerName = getCustomerName(
        application
      ).toLowerCase();

      const applicationId =
        application.id.toLowerCase();

      const userId =
        application.user_id.toLowerCase();

      return (
        customerName.includes(query) ||
        applicationId.includes(query) ||
        userId.includes(query)
      );
    });
  }

  results.sort((a, b) => {
    const first =
      new Date(a.created_at).getTime();

    const second =
      new Date(b.created_at).getTime();

    return sort === "oldest"
      ? first - second
      : second - first;
  });

  return results;
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    sort?: string;
  }>;
}) {
  const applications = await getAllApplications();

  const params = await searchParams;

  const search = params.search ?? "";
  const status = params.status ?? "";
  const type = params.type ?? "";
  const sort = params.sort ?? "newest";

  const filteredApplications =
    filterApplications(
      applications,
      search,
      status,
      type,
      sort
    );

  return (
    <>
      <AdminNav />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          {/* Header */}

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Administration
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Application Inbox
              </h1>

              <p className="mt-2 text-slate-600">
                Search, filter, and review customer loan applications.
              </p>
            </div>

            <Link
              href="/admin"
              className="text-sm font-semibold text-blue-700 hover:underline"
            >
              ← Admin Dashboard
            </Link>
          </div>

          {/* Summary */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Total" value={applications.length} />

            <SummaryCard
              label="Submitted"
              value={applications.filter((a) => a.status === "submitted").length}
            />

            <SummaryCard
              label="Under Review"
              value={applications.filter((a) => a.status === "under_review").length}
            />

            <SummaryCard
              label="Approved"
              value={applications.filter((a) => a.status === "approved").length}
            />

            <SummaryCard
              label="Declined"
              value={applications.filter((a) => a.status === "declined").length}
            />
          </div>

          {/* Inbox */}

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ApplicationFilters />

            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-semibold text-slate-900">Applications</h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Showing <strong className="text-slate-700">{filteredApplications.length}</strong> of <strong className="text-slate-700">{applications.length}</strong> applications.
                  </p>
                </div>

                {(search || status || type) && (
                  <p className="text-sm text-blue-700">Filters active</p>
                )}
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="text-4xl">🔎</div>

                <h2 className="mt-4 text-lg font-semibold">No matching applications</h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Application
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Loan Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredApplications.map((application) => {
                      const status = getStatusInfo(application.status);

                      return (
                        <tr key={application.id} className="transition hover:bg-slate-50">
                          <td className="px-6 py-5">
                            <p className="font-semibold text-slate-900">
                              {getCustomerName(application)}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Customer ID: {application.user_id.slice(0, 8)}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-mono text-sm font-medium text-slate-800">
                              {application.id.slice(0, 8)}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {application.id}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-700">
                            {formatLoanType(application.loan_type)}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {formatDate(application.created_at)}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <Link
                              href={`/admin/applications/${application.id}`}
                              className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}