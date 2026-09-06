import AdminNav from "../../AdminNav";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Verify admin
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Load customer
  const { data: customer, error: customerError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone, role, created_at")
    .eq("id", id)
    .eq("role", "customer")
    .single();

  if (customerError || !customer) {
    notFound();
  }

  // Load customer's applications
  const { data: applications } = await supabase
    .from("loan_applications")
    .select(
      "id, loan_type, status, created_at, updated_at"
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const fullName =
    [customer.first_name, customer.last_name]
      .filter(Boolean)
      .join(" ") || "Unnamed Customer";

  return (
    <>
      <AdminNav />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Link
            href="/admin/customers"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Customers
          </Link>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Customer Profile
                </p>

                <h1 className="mt-1 text-3xl font-bold text-slate-900">
                  {fullName}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Customer ID: {customer.id}
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                Customer
              </span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">First Name</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {customer.first_name || "—"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Last Name</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {customer.last_name || "—"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Phone</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {customer.phone || "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Joined</p>
              <p className="mt-1 font-semibold text-slate-900">
                {new Date(customer.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Loan Applications
              </h2>

              <p className="text-sm text-slate-500">
                Applications submitted by this customer.
              </p>
            </div>

            {applications && applications.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                          Type
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                          Status
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                          Created
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {applications.map((application) => (
                        <tr
                          key={application.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-6 py-4 font-medium capitalize text-slate-900">
                            {application.loan_type} loan
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                              {application.status.replace("_", " ")}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(application.created_at).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/applications/${application.id}`}
                              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                              Review →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <h3 className="font-semibold text-slate-900">
                  No applications
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  This customer has not created any loan applications yet.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}