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

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Document ID is required" },
      { status: 400 }
    );
  }

 const { data: document, error } = await supabase
  .from("application_documents")
  .select("id, storage_path, file_name")
  .eq("id", id)
  .eq("user_id", user.id)
  .maybeSingle();

if (error) {
  console.error("CUSTOMER DOCUMENT LOOKUP ERROR:", error);

  return NextResponse.json(
    {
      error: "Unable to find document",
      details: error.message,
    },
    { status: 500 }
  );
}

console.log("CUSTOMER DOCUMENT LOOKUP:", {
  requestedId: id,
  authenticatedUserId: user.id,
  document,
});

if (!document) {
  return NextResponse.json(
    { error: "Document not found" },
    { status: 404 }
  );
}

  const { data: signedUrl, error: signedUrlError } =
    await supabase.storage
      .from("application-documents")
      .createSignedUrl(document.storage_path, 60);

  if (signedUrlError || !signedUrl?.signedUrl) {
    console.error("Signed URL error:", signedUrlError);

    return NextResponse.json(
      { error: "Unable to create secure document link" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}