"use client";

import { useEffect, useState } from "react";

type Verification = {
  identity_status: "not_started" | "pending" | "verified" | "failed";
  ssn_last4: string | null;
  bank_status: "not_started" | "pending" | "verified" | "failed";
  bank_account_last4: string | null;
  bank_routing_last4: string | null;
  verification_provider: string | null;
  verified_at: string | null;
};

type VerificationCenterProps = {
  applicationId: string;
};

function statusLabel(status: string) {
  switch (status) {
    case "verified":
      return "Verified";
    case "pending":
      return "Pending";
    case "failed":
      return "Needs Attention";
    default:
      return "Not Started";
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "verified":
      return "border-green-200 bg-green-50 text-green-800";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "failed":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function StatusIcon({ status }: { status: string }) {
  if (status === "verified") {
    return <span aria-hidden="true">✓</span>;
  }

  if (status === "failed") {
    return <span aria-hidden="true">!</span>;
  }

  if (status === "pending") {
    return <span aria-hidden="true">◷</span>;
  }

  return <span aria-hidden="true">○</span>;
}

export default function VerificationCenter({
  applicationId,
}: VerificationCenterProps) {
  const [verification, setVerification] =
    useState<Verification | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadVerification() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/applications/verification?applicationId=${encodeURIComponent(
            applicationId,
          )}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load verification status.",
          );
        }

        if (!cancelled) {
          setVerification(result.verification);
        }
      } catch (verificationError) {
        if (!cancelled) {
          setError(
            verificationError instanceof Error
              ? verificationError.message
              : "Unable to load verification status.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadVerification();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const identityVerified =
    verification?.identity_status === "verified";

  const bankVerified =
    verification?.bank_status === "verified";

  const everythingVerified =
    identityVerified && bankVerified;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#dfe4ec] bg-white shadow-sm">
      <div className="border-b border-[#dfe4ec] px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#172033]">
              Verification Center
            </h2>

            <p className="mt-1 text-sm text-[#687386]">
              Complete the required verification steps before
              submitting your application.
            </p>
          </div>

          {!loading && (
            <span
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                everythingVerified
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {everythingVerified
                ? "Verification Complete"
                : "Verification Required"}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="rounded-xl border border-[#edf0f4] bg-[#f8fafc] p-5">
            <p className="text-sm text-[#687386]">
              Loading verification status...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-800">
              Unable to load verification
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        ) : verification ? (
          <div className="space-y-4">
            {/* Identity */}
            <div className="rounded-xl border border-[#edf0f4] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                      verification.identity_status === "verified"
                        ? "bg-green-100 text-green-700"
                        : "bg-[#eaf2ff] text-[#1769e0]"
                    }`}
                  >
                    <StatusIcon
                      status={verification.identity_status}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#172033]">
                      Identity Verification
                    </h3>

                    <p className="mt-1 text-sm text-[#687386]">
                      Verify your identity before your application
                      can proceed through final review.
                    </p>

                    {verification.ssn_last4 && (
                      <p className="mt-2 text-xs font-medium text-[#687386]">
                        SSN ending in ••••{" "}
                        {verification.ssn_last4}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                    verification.identity_status,
                  )}`}
                >
                  {statusLabel(
                    verification.identity_status,
                  )}
                </span>
              </div>

              {verification.identity_status !== "verified" && (
                <div className="mt-4 rounded-lg bg-[#f8fafc] p-4">
                  <p className="text-xs leading-5 text-[#687386]">
                    Identity verification will be completed
                    through a secure verification process. Do not
                    send your full Social Security number through
                    ordinary messages or application notes.
                  </p>
                </div>
              )}
            </div>

            {/* Bank */}
            <div className="rounded-xl border border-[#edf0f4] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                      verification.bank_status === "verified"
                        ? "bg-green-100 text-green-700"
                        : "bg-[#eaf2ff] text-[#1769e0]"
                    }`}
                  >
                    <StatusIcon
                      status={verification.bank_status}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#172033]">
                      Bank Account Verification
                    </h3>

                    <p className="mt-1 text-sm text-[#687386]">
                      Verify an eligible bank account for
                      application-related processing and, where
                      applicable, disbursement.
                    </p>

                    {verification.bank_account_last4 && (
                      <p className="mt-2 text-xs font-medium text-[#687386]">
                        Account ending in ••••{" "}
                        {verification.bank_account_last4}
                      </p>
                    )}

                    {verification.bank_routing_last4 && (
                      <p className="mt-1 text-xs font-medium text-[#687386]">
                        Routing ending in ••••{" "}
                        {verification.bank_routing_last4}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                    verification.bank_status,
                  )}`}
                >
                  {statusLabel(
                    verification.bank_status,
                  )}
                </span>
              </div>

              {verification.bank_status !== "verified" && (
                <div className="mt-4 rounded-lg bg-[#f8fafc] p-4">
                  <p className="text-xs leading-5 text-[#687386]">
                    Bank verification will use a secure provider
                    integration. Full account credentials should
                    never be stored in this application record.
                  </p>
                </div>
              )}
            </div>

            {/* Security notice */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-3">
                <span
                  className="mt-0.5 text-blue-700"
                  aria-hidden="true"
                >
                  🔒
                </span>

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Your information is protected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-800">
                    Only verification status and limited masked
                    information are retained in the application
                    record. Sensitive credentials should be
                    handled through the secure verification
                    provider.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}