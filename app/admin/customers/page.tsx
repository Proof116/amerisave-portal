import AdminNav from "../AdminNav";
import Link from "next/link";
import { getAllCustomers } from "@/lib/admin/customers";

function getCustomerName(customer: {
  first_name: string | null;
  last_name: string | null;
}) {
  const name = `${customer.first_name ?? ""} ${
    customer.last_name ?? ""
  }`.trim();

  return name || "Unnamed Customer";
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";

  const customers = await getAllCustomers(search);

  return (
    <>
      <AdminNav />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8">
            <Link
              href="/admin"
              className="text-sm font-medium text-[#1769e0]"
            >
              ← Back to Command Center
            </Link>

            <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#1769e0]">
                  Customer Management
                </p>

                <h1 className="mt-2 text-3xl font-bold text-[#172033]">
                  Customers
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  View customers and their application activity.
                </p>
              </div>

              <div className="rounded-2xl border border-[#dfe4ec] bg-white px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {search ? "Matching Customers" : "Total Customers"}
                </p>

                <p className="mt-1 text-2xl font-bold text-[#172033]">
                  {customers.length}
                </p>
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#dfe4ec] bg-white">
            <div className="border-b border-[#dfe4ec] px-6 py-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-[#172033]">
                    Customer Directory
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Search registered customer accounts.
                  </p>
                </div>

                <form
                  method="get"
                  className="flex w-full max-w-md gap-2"
                >
                  <input
                    type="search"
                    name="search"
                    defaultValue={search}
                    placeholder="Search name, phone, or customer ID..."
                    className="w-full rounded-xl border border-[#dfe4ec] bg-white px-4 py-3 text-sm text-[#172033] outline-none transition focus:border-[#1769e0] focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="submit"
                    className="rounded-xl bg-[#1769e0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Search
                  </button>
                </form>
              </div>

              {search && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <span>Showing results for: {search}</span>

                  <Link
                    href="/admin/customers"
                    className="font-semibold underline"
                  >
                    Clear
                  </Link>
                </div>
              )}
            </div>

            {customers.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="text-4xl">🔎</div>
                <h3 className="mt-4 text-lg font-semibold text-[#172033]">
                  No matching customers
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try a different search term or clear the current filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-[#dfe4ec] bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Applications
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-[#edf0f4] last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-[#172033]">
                              {getCustomerName(customer)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {customer.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {customer.phone || "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(customer.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {customer.application_count}
                        </td>

                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="text-sm font-semibold text-[#1769e0] hover:underline"
                          >
                            View profile →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
