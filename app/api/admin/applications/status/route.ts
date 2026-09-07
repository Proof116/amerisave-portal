import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "submitted",
  "under_review",
  "approved",
  "declined",
] as const;

type AllowedStatus = (typeof allowedStatuses)[number];

function isAllowedStatus(value: string): value is AllowedStatus {
  return allowedStatuses.includes(value as AllowedStatus);
}

function redirectToApplication(
  request: Request,
  applicationId: string,
  params?: Record<string, string>
) {
  const url = new URL(
    `/admin/applications/${applicationId}`,
    request.url
  );

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url),
      303
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(
      new URL("/dashboard", request.url),
      303
    );
  }

  const formData = await request.formData();

  const applicationId = formData.get("applicationId");
  const requestedStatus = formData.get("status");

  if (
    typeof applicationId !== "string" ||
    !applicationId ||
    typeof requestedStatus !== "string" ||
    !isAllowedStatus(requestedStatus)
  ) {
    return NextResponse.redirect(
      new URL("/admin/applications", request.url),
      303
    );
  }

  const { data: application, error: fetchError } = await supabase
    .from("loan_applications")
    .select("id, status")
    .eq("id", applicationId)
    .single();

  if (fetchError || !application) {
    return NextResponse.redirect(
      new URL("/admin/applications", request.url),
      303
    );
  }

  if (application.status === requestedStatus) {
    return redirectToApplication(request, applicationId, {
      notice: "status_unchanged",
    });
  }

  // Final decisions require the application to be under review.
  if (
    (requestedStatus === "approved" ||
      requestedStatus === "declined") &&
    application.status !== "under_review"
  ) {
    return redirectToApplication(request, applicationId, {
      error: "invalid_status_transition",
    });
  }

  const { error: updateError } = await supabase
    .from("loan_applications")
    .update({
      status: requestedStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (updateError) {
    console.error("Admin status update error:", updateError);

    return redirectToApplication(request, applicationId, {
      error: "status_update_failed",
    });
  }

  return redirectToApplication(request, applicationId, {
    success: "status_updated",
  });
}
