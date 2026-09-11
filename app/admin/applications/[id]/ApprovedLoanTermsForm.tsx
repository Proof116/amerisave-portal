"use client";

import { useMemo, useState } from "react";
import { calculateLoanTerms } from "@/lib/lending/loan-terms";

type Props = {
  applicationId: string;
  defaultAmount?: number | null;
  defaultApr?: number | null;
  defaultTermMonths?: number | null;
  defaultProcessingFee?: number | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function ApprovedLoanTermsForm({
  applicationId,
  defaultAmount,
  defaultApr,
  defaultTermMonths,
  defaultProcessingFee,
}: Props) {
  const [amount, setAmount] = useState(
    defaultAmount ? String(defaultAmount) : ""
  );

  const [apr, setApr] = useState(
    defaultApr !== null && defaultApr !== undefined
      ? String(defaultApr)
      : ""
  );

  const [termMonths, setTermMonths] = useState(
    defaultTermMonths ? String(defaultTermMonths) : ""
  );

  const calculatedTerms = useMemo(() => {
    const principal = Number(amount);
    const annualRate = Number(apr);
    const months = Number(termMonths);

    if (
      !Number.isFinite(principal) ||
      principal <= 0 ||
      !Number.isFinite(annualRate) ||
      annualRate < 0 ||
      !Number.isInteger(months) ||
      months <= 0
    ) {
      return null;
    }

    try {
      return calculateLoanTerms({
        principal,
        apr: annualRate,
        termMonths: months,
      });
    } catch {
      return null;
    }
  }, [amount, apr, termMonths]);

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
      <div>
        <h2 className="text-lg font-semibold text-blue-950">
          Approved Loan Terms
        </h2>

        <p className="mt-1 text-sm leading-6 text-blue-800">
          Enter the final approved amount, APR, and repayment term. The
          remaining repayment figures are calculated automatically.
        </p>
      </div>

      <form
        action="/api/admin/applications/status"
        method="POST"
        className="mt-6 space-y-5"
      >
        <input
          type="hidden"
          name="applicationId"
          value={applicationId}
        />

        <input
          type="hidden"
          name="status"
          value="approved"
        />

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label
              htmlFor="approvedLoanAmount"
              className="mb-2 block text-sm font-semibold text-blue-950"
            >
              Approved Loan Amount
            </label>

            <input
              id="approvedLoanAmount"
              name="approvedLoanAmount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1769e0] focus:ring-2 focus:ring-blue-100"
              placeholder="3000.00"
            />
          </div>

          <div>
            <label
              htmlFor="approvedApr"
              className="mb-2 block text-sm font-semibold text-blue-950"
            >
              APR (%)
            </label>

            <input
              id="approvedApr"
              name="approvedApr"
              type="number"
              min="0"
              step="0.01"
              value={apr}
              onChange={(event) => setApr(event.target.value)}
              required
              className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1769e0] focus:ring-2 focus:ring-blue-100"
              placeholder="18.99"
            />
          </div>

          <div>
            <label
              htmlFor="approvedTermMonths"
              className="mb-2 block text-sm font-semibold text-blue-950"
            >
              Loan Duration (months)
            </label>

            <input
              id="approvedTermMonths"
              name="approvedTermMonths"
              type="number"
              min="1"
              step="1"
              value={termMonths}
              onChange={(event) => setTermMonths(event.target.value)}
              required
              className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1769e0] focus:ring-2 focus:ring-blue-100"
              placeholder="24"
            />
          </div>
        </div>

        {calculatedTerms && (
          <div className="grid gap-3 rounded-2xl border border-blue-200 bg-white p-5 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Monthly Payment
              </p>
              <p className="mt-1 text-lg font-bold text-[#172033]">
                {formatCurrency(calculatedTerms.monthlyPayment)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Total Repayment
              </p>
              <p className="mt-1 text-lg font-bold text-[#172033]">
                {formatCurrency(calculatedTerms.totalRepayment)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Total Interest
              </p>
              <p className="mt-1 text-lg font-bold text-[#172033]">
                {formatCurrency(calculatedTerms.totalInterest)}
              </p>
            </div>

            {defaultProcessingFee !== null &&
              defaultProcessingFee !== undefined && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Processing Fee
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#172033]">
                    {formatCurrency(defaultProcessingFee)}
                  </p>
                </div>
              )}
          </div>
        )}

        <div className="rounded-xl border border-blue-200 bg-blue-100/60 p-4 text-sm leading-6 text-blue-900">
          The approved terms should reflect the actual underwriting decision
          and applicable disclosures. The processing fee, if applicable, is
          separate from the loan principal and does not itself create a funded
          loan balance.
        </div>

        <button
          type="submit"
          disabled={!calculatedTerms}
          className="w-full rounded-xl bg-[#1769e0] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve Application With These Terms
        </button>
      </form>
    </section>
  );
}
