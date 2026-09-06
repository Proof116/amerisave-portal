import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "under_review",
  "accepted",
  "rejected",
] as const;

type DocumentStatus = (typeof allowedStatuses)[number];

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("ADMIN DOCUMENT STATUS SESSION:", {
    hasSession: !!session,
    userId: session?.user?.id ?? null,
  });

  if (!session?.user) {
    console.error("ADMIN DOCUMENT STATUS AUTH FAILED");

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = session.user;

  console.log("ADMIN DOCUMENT STATUS AUTH OK:", user.id);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  let body: {
    documentId?: string;
    status?: DocumentStatus;
    rejectionReason?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { documentId, status, rejectionReason } = body;

  if (!documentId || !status) {
    return NextResponse.json(
      { error: "Document ID and status are required" },
      { status: 400 }
    );
  }

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Invalid document status" },
      { status: 400 }
    );
  }

  if (
    status === "rejected" &&
    (!rejectionReason || !rejectionReason.trim())
  ) {
    return NextResponse.json(
      { error: "A rejection reason is required" },
      { status: 400 }
    );
  }

  const { data: updatedDocument, error: updateError } =
  await supabase.rpc("admin_update_document_status", {
    target_document_id: documentId,
    target_status: status,
    target_rejection_reason:
      status === "rejected"
        ? rejectionReason?.trim() || null
        : null,
  });

if (updateError) {
  console.error("Admin document status RPC error:", updateError);

  return NextResponse.json(
    {
      error: updateError.message || "Unable to update document",
    },
    { status: 500 }
  );
}

if (!updatedDocument || updatedDocument.length === 0) {
  return NextResponse.json(
    { error: "Document not found" },
    { status: 404 }
  );
}

  return NextResponse.json({
    success: true,
    documentId,
    status,
  });
}