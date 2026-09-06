import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedDocumentTypes = [
  "identity",
  "income",
  "assets",
  "property",
  "other",
] as const;

type DocumentType = (typeof allowedDocumentTypes)[number];

function isDocumentType(value: string): value is DocumentType {
  return allowedDocumentTypes.includes(value as DocumentType);
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await request.formData();

  const applicationId = formData.get("applicationId");
  const documentType = formData.get("documentType");
  const file = formData.get("file");

  if (
    typeof applicationId !== "string" ||
    !applicationId
  ) {
    return NextResponse.json(
      { error: "Application ID is required." },
      { status: 400 }
    );
  }

  if (
    typeof documentType !== "string" ||
    !isDocumentType(documentType)
  ) {
    return NextResponse.json(
      { error: "Invalid document type." },
      { status: 400 }
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A file is required." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "The uploaded file is empty." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File must be 10 MB or smaller." },
      { status: 400 }
    );
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return NextResponse.json(
      {
        error:
          "Only PDF, JPG, and PNG files are allowed.",
      },
      { status: 400 }
    );
  }

  // Verify that this application belongs to the
  // currently authenticated customer.
  const { data: application, error: applicationError } =
    await supabase
      .from("loan_applications")
      .select("id, user_id")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .single();

  if (applicationError || !application) {
    return NextResponse.json(
      { error: "Application not found." },
      { status: 404 }
    );
  }

  const safeFileName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 150);

  const uniqueFileName = `${crypto.randomUUID()}-${safeFileName}`;

  const storagePath = `${user.id}/${applicationId}/${uniqueFileName}`;

  // Upload the actual file.
  const { error: uploadError } = await supabase.storage
    .from("application-documents")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Document storage upload error:", uploadError);

    return NextResponse.json(
      { error: "Unable to upload document." },
      { status: 500 }
    );
  }

  // Store metadata in application_documents.
  const { data: document, error: documentError } =
    await supabase
      .from("application_documents")
      .insert({
        application_id: application.id,
        user_id: user.id,
        document_type: documentType,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        file_size: file.size,
        status: "uploaded",
      })
      .select()
      .single();

  if (documentError || !document) {
    console.error(
      "Document metadata insert error:",
      documentError
    );

    // Remove the uploaded file if the metadata insert failed.
    await supabase.storage
      .from("application-documents")
      .remove([storagePath]);

    return NextResponse.json(
      { error: "Unable to save document information." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      document,
    },
    { status: 201 }
  );
}