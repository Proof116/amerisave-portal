"use client";

import { useState } from "react";

type DocumentReviewActionsProps = {
  documentId: string;
  currentStatus: string;
};

export default function DocumentReviewActions({
  documentId,
  currentStatus,
}: DocumentReviewActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(
    nextStatus: "under_review" | "accepted" | "rejected"
  ) {
    setError("");

    let rejectionReason = "";

    if (nextStatus === "rejected") {
      const reason = window.prompt(
        "Enter the reason this document is being rejected:"
      );

      if (reason === null) {
        return;
      }

      rejectionReason = reason.trim();

      if (!rejectionReason) {
        setError("A rejection reason is required.");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/documents/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          status: nextStatus,
          rejectionReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update document status."
        );
      }

      setStatus(nextStatus);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update document status."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || status === "under_review"}
          onClick={() => updateStatus("under_review")}
          className="rounded-xl border border-[#dfe4ec] px-3 py-2 text-xs font-semibold text-[#172033] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Under Review
        </button>

        <button
          type="button"
          disabled={loading || status === "accepted"}
          onClick={() => updateStatus("accepted")}
          className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Accept
        </button>

        <button
          type="button"
          disabled={loading || status === "rejected"}
          onClick={() => updateStatus("rejected")}
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      {loading && (
        <p className="mt-2 text-xs text-gray-500">
          Updating document...
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <p className="mt-2 text-xs text-gray-500">
          Current status:{" "}
          <span className="font-semibold capitalize">
            {status.replace("_", " ")}
          </span>
        </p>
      )}
    </div>
  );
}