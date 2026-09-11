"use client";

import { useState } from "react";

type Props = {
  applicationId: string;
  processingFee: number;
};

export default function FundLoanButton({
  applicationId,
  processingFee,
}: Props) {
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (processingFee > 0) {
      const confirmed = window.confirm(
        "Confirm that the required processing fee has been successfully paid through Stripe and that this approved loan is ready for funding."
      );

      if (!confirmed) {
        event.preventDefault();
        return;
      }
    }

    setSubmitting(true);
  }

  return (
    <form
      action="/api/admin/applications/fund"
      method="POST"
      onSubmit={handleSubmit}
    >
      <input
        type="hidden"
        name="applicationId"
        value={applicationId}
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Funding Loan..." : "Fund Loan"}
      </button>
    </form>
  );
}