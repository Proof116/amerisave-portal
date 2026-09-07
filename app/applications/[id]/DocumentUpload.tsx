"use client";

import { useRef, useState } from "react";

const documentTypes = [
  { value: "identity", label: "Identity Document" },
  { value: "income", label: "Income Document" },
  { value: "assets", label: "Asset Document" },
  { value: "property", label: "Property Document" },
  { value: "other", label: "Other" },
];

type Document = {
  id: string;
  document_type: string;
  file_name: string;
  file_size: number | null;
  status: string;
  rejection_reason: string | null;
  uploaded_at: string;
};

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

export default function DocumentUpload({
  applicationId,
  initialDocuments,
}: {
  applicationId: string;
  initialDocuments: Document[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentType, setDocumentType] = useState("identity");
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setError("");
    setMessage("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setError("File must be 10 MB or smaller.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setError("Only PDF, JPG, and PNG files are allowed.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!selectedFile) {
      setError("Please select a document first.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("applicationId", applicationId);
      formData.append("documentType", documentType);
      formData.append("file", selectedFile);

      const response = await fetch(
        "/api/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to upload document."
        );
      }

      setDocuments((current) => [
        result.document,
        ...current,
      ]);

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Document uploaded successfully.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload document."
      );
    } finally {
      setUploading(false);
    }
  }

  function getStatusClasses(status: string) {
    switch (status) {
      case "accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "under_review":
        return "bg-amber-50 text-amber-700 border-amber-200";

      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  }

  function getTypeLabel(type: string) {
    return (
      documentTypes.find(
        (document) => document.value === type
      )?.label ?? type
    );
  }

  function formatFileSize(bytes: number | null) {
    if (!bytes) {
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

  return (
    <section className="rounded-2xl border border-[#dfe4ec] bg-white">
      <div className="border-b border-[#dfe4ec] p-6">
        <h2 className="text-lg font-semibold text-[#172033]">
          Application Documents
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Upload documents related to your application.
        </p>
      </div>

      <div className="p-6">
        <form
          onSubmit={handleUpload}
          className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="documentType"
                className="mb-2 block text-sm font-medium text-[#172033]"
              >
                Document Type
              </label>

              <select
                id="documentType"
                value={documentType}
                onChange={(event) =>
                  setDocumentType(event.target.value)
                }
                disabled={uploading}
                className="w-full rounded-xl border border-[#dfe4ec] bg-white px-4 py-3 text-sm outline-none focus:border-[#1769e0] focus:ring-2 focus:ring-blue-100"
              >
                {documentTypes.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="documentFile"
                className="mb-2 block text-sm font-medium text-[#172033]"
              >
                File
              </label>

              <input
                ref={fileInputRef}
                id="documentFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full rounded-xl border border-[#dfe4ec] bg-white px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-gray-500">
              PDF, JPG, or PNG · Maximum 10 MB
            </p>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="rounded-xl bg-[#1769e0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#172033]">
              Uploaded Documents
            </h3>

            <span className="text-xs text-gray-400">
              {documents.length}{" "}
              {documents.length === 1
                ? "document"
                : "documents"}
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#dfe4ec] p-6 text-center text-sm text-gray-500">
              No documents uploaded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-xl border border-[#dfe4ec] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#172033]">
                        {document.file_name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {getTypeLabel(
                          document.document_type
                        )}{" "}
                        ·{" "}
                        {formatFileSize(
                          document.file_size
                        )}{" "}
                        ·{" "}
                        {new Date(
                          document.uploaded_at
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          document.status
                        )}`}
                      >
                        {getDocumentStatusLabel(document.status)}
                      </span>

                      <a
                        href={`/api/documents/view?id=${document.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-[#dfe4ec] px-3 py-2 text-xs font-semibold text-[#1769e0] transition hover:bg-blue-50"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800">
  <p className="font-semibold">
    Document Security
  </p>

  <p className="mt-1">
    Upload only documents requested for your application.
    Documents are stored securely and may be reviewed as
    part of the application process. Do not upload passwords
    or unrelated sensitive information.
  </p>
</div>
      </div>
    </section>
  );
}