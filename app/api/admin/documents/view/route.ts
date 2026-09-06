import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const documentId = url.searchParams.get("id");

  if (!documentId) {
    return NextResponse.json(
      { error: "Document ID is required." },
      { status: 400 }
    );
  }

  const { data: document, error: documentError } =
    await supabase
      .from("application_documents")
      .select(
        "id, application_id, storage_path, file_name"
      )
      .eq("id", documentId)
      .single();

  if (documentError || !document) {
    return NextResponse.json(
      { error: "Document not found." },
      { status: 404 }
    );
  }

  const { data: signedUrl, error: signedUrlError } =
    await supabase.storage
      .from("application-documents")
      .createSignedUrl(
        document.storage_path,
        60
      );

  if (signedUrlError || !signedUrl?.signedUrl) {
    console.error(
      "Signed URL error:",
      signedUrlError
    );

    return NextResponse.json(
      { error: "Unable to create secure document URL." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    signedUrl.signedUrl,
    303
  );
}