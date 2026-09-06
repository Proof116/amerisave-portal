"use client";

import { useState } from "react";

type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled";

export default function PaymentButton({
  applicationId,
  paymentStatus,
}: {
  applicationId: string;
  paymentStatus?: PaymentStatus;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const paymentInProgress =
    paymentStatus === "pending" ||
    paymentStatus === "processing";

  const paymentComplete = paymentStatus === "succeeded";

  async function handlePayment() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to start payment"
        );
      }

      if (!data.checkoutUrl) {
        throw new Error(
          "Stripe checkout URL was not returned"
        );
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment"
      );
      setLoading(false);
    }
  }

  if (paymentComplete) {
    return (
      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-900">
          Processing fee paid
        </p>

        <p className="mt-1 text-sm leading-6 text-green-800">
          Your payment has been recorded. Payment does not by itself
          guarantee loan funding or disbursement.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading || paymentInProgress}
        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Opening secure checkout..."
          : paymentInProgress
            ? "Payment Processing"
            : "Pay $300 Processing Fee"}
      </button>

      {paymentStatus === "failed" && (
        <p className="mt-3 text-sm text-red-600">
          The previous payment attempt was unsuccessful. You may try
          again.
        </p>
      )}

      {paymentStatus === "cancelled" && (
        <p className="mt-3 text-sm text-gray-600">
          The previous payment was cancelled. You can try again when
          you&apos;re ready.
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <p className="mt-3 text-xs leading-5 text-gray-500">
        This is a disclosed processing fee associated with the
        approved application. Payment is handled securely by Stripe.
        Paying this fee does not guarantee approval, loan funding, or
        access to loan proceeds.
      </p>
    </div>
  );
}
