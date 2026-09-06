import AdminNav from "../AdminNav";
import { getAllPayments } from "@/lib/admin/payments";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusClasses(status: string) {
  switch (status) {
    case "succeeded":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default async function AdminPaymentsPage() {
  const payments = await getAllPayments();
  const successfulPayments = payments.filter(
    (payment) => payment.status === "succeeded"
  );
  const totalCollected = successfulPayments.reduce(
    (total, payment) => total + Number(payment.amount),
    0
  );

  return (
    <>
      <AdminNav />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">Administration</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            Payment Center
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor application-related payment activity and Stripe transaction
            status.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Payments</p>
            <p className="mt-2 text-3xl font-bold text-gray-950">
              {payments.length}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Successful Payments
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-950">
              {successfulPayments.length}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Collected</p>
            <p className="mt-2 text-3xl font-bold text-gray-950">
              {formatMoney(totalCollected, "usd")}
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-950">
              Payment Transactions
            </h2>
          </div>

          {payments.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No payment transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Application</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Paid</th>
                    <th className="px-6 py-4">Stripe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-5">
                        <p className="font-medium text-gray-950">
                          {payment.purpose === "processing_fee"
                            ? "Processing Fee"
                            : "Origination Fee"}
                        </p>
                        <p className="mt-1 max-w-[180px] truncate text-xs text-gray-500">
                          {payment.id}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="max-w-[180px] truncate text-xs text-gray-600">
                          {payment.application_id}
                        </p>
                      </td>
                      <td className="px-6 py-5 font-medium text-gray-950">
                        {formatMoney(Number(payment.amount), payment.currency)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(payment.status)}`}
                        >
                          {payment.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-600">
                        {formatDate(payment.paid_at)}
                      </td>
                      <td className="px-6 py-5">
                        <p className="max-w-[180px] truncate text-xs text-gray-500">
                          {payment.stripe_payment_intent_id ?? "—"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}