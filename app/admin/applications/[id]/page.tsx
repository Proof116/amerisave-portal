import DocumentReviewActions from "./DocumentReviewActions";
import AdminNav from "../../AdminNav";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Draft";
    case "submitted":
      return "Submitted";
    case "under_review":
      return "Under Review";
    case "approved":
      return "Approved";
    case "declined":
      return "Declined";
    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "declined":
      return "bg-red-50 text-red-700 border-red-200";

    case "under_review":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "submitted":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "draft":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getAnswerLabel(key: string) {
  const labels: Record<string, string> = {
    purpose: "Loan Purpose",
    state: "Property State",
    homeValue: "Estimated Home Value",
    loanAmount: "Requested Loan Amount",
    employment: "Employment",
    incomeRange: "Annual Income Range",
  };

  return labels[key] || key;
}

function getEventLabel(eventType: string) {
  switch (eventType) {
    case "application_created":
      return "Application Created";

    case "status_changed":
      return "Status Changed";

    default:
      return eventType.replaceAll("_", " ");
  }
}

function getDocumentTypeLabel(type: string) {
  switch (type) {
    case "identity":
      return "Identity";
    case "income":
      return "Income";
    case "assets":
      return "Assets";
    case "property":
      return "Property";
    case "other":
      return "Other";
    default:
      return type;
  }
}

function getDocumentStatusLabel(status: string) {
  switch (status) {
    case "uploaded":
      return "Uploaded";
    case "under_review":
      return "Under Review";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

function formatFileSize(bytes: number | null) {
  if (!bytes || bytes <= 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ApplicationDocument = {
  id: string;
  file_name: string;
  document_type: string;
  file_size: number | null;
  uploaded_at: string;
  status: string;
  rejection_reason: string | null;
};

export default async function AdminApplicationReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    success?: string;
    notice?: string;
    error?: string;
  }>;
}) {
  const { id } = await params;
  const { success, notice, error: queryError } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: application, error } = await supabase
    .from("loan_applications")
    .select(
      "id, user_id, loan_type, status, answers, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (error || !application) {
    notFound();
  }

  const { data: customer } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone")
    .eq("id", application.user_id)
    .single();

  const { data: events } = await supabase
    .from("application_events")
    .select(
      "id, event_type, old_status, new_status, description, created_at"
    )
    .eq("application_id", application.id)
    .order("created_at", { ascending: false });

  const { data: documentsData, error: documentsError } =
    await supabase.rpc("admin_get_application_documents", {
      target_application_id: application.id,
    });

  const documents = (documentsData ?? []) as ApplicationDocument[];

if (documentsError) {
  console.error("Admin document RPC error:", {
    message: documentsError.message,
    details: documentsError.details,
    hint: documentsError.hint,
    code: documentsError.code,
  });
}
  
  const answers =
    application.answers &&
    typeof application.answers === "object"
      ? (application.answers as Record<string, unknown>)
      : {};
      
      console.log("ADMIN APPLICATION ANSWER KEYS:", Object.keys(answers));
console.log("ADMIN APPLICATION ANSWERS:", answers);

  const customerName =
    customer?.first_name || customer?.last_name
      ? `${customer?.first_name ?? ""} ${
          customer?.last_name ?? ""
        }`.trim()
      : "Customer";

  return (
    <>
      <AdminNav />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8">
            <Link
              href="/admin/applications"
              className="text-sm font-medium text-[#1769e0]"
            >
              ← Back to Applications
            </Link>

            <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#1769e0]">
                  Application Review Center
                </p>

                <h1 className="mt-2 text-3xl font-bold text-[#172033]">
                  {application.loan_type === "home"
                    ? "Home Loan Application"
                    : "Personal Loan Application"}
                </h1>

                <p className="mt-2 break-all text-sm text-gray-500">
                  Application ID: {application.id}
                </p>
              </div>

              <div
                className={`inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClasses(
                  application.status
                )}`}
              >
                {getStatusLabel(application.status)}
              </div>
            </div>
          </div>

          {success === "status_updated" && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg text-emerald-600">✓</span>

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Application status updated successfully.
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    The application activity timeline has been updated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {notice === "status_unchanged" && (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg text-blue-600">ℹ</span>

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    No status change was made.
                  </p>

                  <p className="mt-1 text-sm text-blue-700">
                    The application is already at the selected status.
                  </p>
                </div>
              </div>
            </div>
          )}

          {queryError === "status_update_failed" && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg text-red-600">!</span>

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    We could not update the application status.
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    Please try again. If the problem continues, check the
                    application permissions and database status.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#dfe4ec] bg-white">
                <div className="border-b border-[#dfe4ec] p-6">
                  <h2 className="text-lg font-semibold text-[#172033]">
                    Customer Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Customer associated with this application.
                  </p>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Customer Name
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#172033]">
                      {customerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Customer ID
                    </p>

                    <p className="mt-2 break-all text-sm font-medium text-[#172033]">
                      {application.user_id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Phone
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#172033]">
                      {customer?.phone || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Application Type
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#172033]">
                      {application.loan_type === "home"
                        ? "Home Loan"
                        : "Personal Loan"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#dfe4ec] bg-white">
                <div className="border-b border-[#dfe4ec] p-6">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-[#172033]">
                        Application Documents
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Documents uploaded for this application.
                      </p>
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {documents?.length ?? 0}{" "}
                      {(documents?.length ?? 0) === 1
                        ? "document"
                        : "documents"}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {!documents || documents.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#dfe4ec] p-8 text-center">
                      <div className="text-3xl">📄</div>

                      <p className="mt-3 text-sm font-semibold text-[#172033]">
                        No documents uploaded
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Documents uploaded by the customer will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((document) => (
                        <div
                          key={document.id}
                          className="rounded-xl border border-[#dfe4ec] p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                                📄
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#172033]">
                                  {document.file_name}
                                </p>

                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                                  <span>
                                    {getDocumentTypeLabel(
                                      document.document_type
                                    )}
                                  </span>

                                  <span>
                                    {formatFileSize(document.file_size)}
                                  </span>

                                  <span>
                                    Uploaded{" "}
                                    {new Date(
                                      document.uploaded_at
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  document.status === "accepted"
                                    ? "bg-green-100 text-green-700"
                                    : document.status === "rejected"
                                      ? "bg-red-100 text-red-700"
                                      : document.status === "under_review"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {getDocumentStatusLabel(document.status)}
                              </span>

                              <Link
                                href={`/api/admin/documents/view?id=${document.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl border border-[#dfe4ec] px-3 py-2 text-xs font-semibold text-[#1769e0] transition hover:bg-blue-50"
                              >
                                View Document
                              </Link>

                              <DocumentReviewActions
                                documentId={document.id}
                                currentStatus={document.status}
                              />
                            </div>
                          </div>

                          {document.status === "rejected" &&
                            document.rejection_reason && (
                              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                                <p className="text-xs font-semibold text-red-800">
                                  Rejection reason
                                </p>
                                <p className="mt-1 text-sm text-red-700">
                                  {document.rejection_reason}
                                </p>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[#dfe4ec] bg-white">
                <div className="border-b border-[#dfe4ec] p-6">
                  <h2 className="text-lg font-semibold text-[#172033]">
                    Application Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Information submitted through the application flow.
                  </p>
                </div>

                <div className="divide-y divide-[#dfe4ec]">
                  {Object.entries(answers).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid gap-2 px-6 py-5 md:grid-cols-2"
                    >
                      <div className="text-sm font-medium text-gray-500">
                        {getAnswerLabel(key)}
                      </div>

                      <div className="text-sm font-semibold text-[#172033]">
                        {value !== null &&
                        value !== undefined &&
                        String(value).trim() !== ""
                          ? String(value)
                          : "Not provided"}
                      </div>
                    </div>
                  ))}

                  {Object.keys(answers).length === 0 && (
                    <div className="p-6 text-sm text-gray-500">
                      No application answers were provided.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[#dfe4ec] bg-white">
                <div className="border-b border-[#dfe4ec] p-6">
                  <h2 className="text-lg font-semibold text-[#172033]">
                    Application Activity
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Chronological record of important application events.
                  </p>
                </div>

                <div className="p-6">
                  {!events || events.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#dfe4ec] p-6 text-center text-sm text-gray-500">
                      No activity has been recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {events.map((event, index) => (
                        <div
                          key={event.id}
                          className="relative flex gap-4"
                        >
                          {index < events.length - 1 && (
                            <div className="absolute left-[9px] top-6 h-full w-px bg-[#dfe4ec]" />
                          )}

                          <div className="relative mt-1 h-5 w-5 shrink-0 rounded-full border-4 border-blue-100 bg-blue-600" />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col justify-between gap-1 sm:flex-row">
                              <p className="text-sm font-semibold text-[#172033]">
                                {getEventLabel(event.event_type)}
                              </p>

                              <p className="text-xs text-gray-400">
                                {new Date(event.created_at).toLocaleString()}
                              </p>
                            </div>

                            {event.old_status && event.new_status && (
                              <p className="mt-1 text-sm text-gray-600">
                                Status changed from{' '}
                                <span className="font-semibold">
                                  {getStatusLabel(event.old_status)}
                                </span>{' '}
                                to{' '}
                                <span className="font-semibold">
                                  {getStatusLabel(event.new_status)}
                                </span>
                                .
                              </p>
                            )}

                            {event.description && (
                              <p className="mt-1 text-sm text-gray-500">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-[#dfe4ec] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#172033]">
                  Review Status
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update the current application status.
                </p>

                <form
                  action="/api/admin/applications/status"
                  method="POST"
                  className="mt-5"
                >
                  <input
                    type="hidden"
                    name="applicationId"
                    value={application.id}
                  />

                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium text-[#172033]"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    defaultValue={application.status}
                    className="w-full rounded-xl border border-[#dfe4ec] bg-white px-4 py-3 text-sm outline-none focus:border-[#1769e0] focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                  </select>

                  <button
                    type="submit"
                    className="mt-4 w-full rounded-xl bg-[#1769e0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    Update Status
                  </button>
                </form>
              </section>

              <section className="rounded-2xl border border-[#dfe4ec] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#172033]">
                  Application Summary
                </h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Created
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#172033]">
                      {new Date(application.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Last Updated
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#172033]">
                      {new Date(application.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Activity Events
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#172033]">
                      {events?.length ?? 0}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                <p className="font-semibold">Development Environment</p>

                <p className="mt-1">
                  This review interface does not make an actual underwriting or
                  lending decision.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
