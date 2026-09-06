import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        new URL("/login", request.url),
        303
      );
    }

    const formData = await request.formData();
    const applicationId = formData.get("applicationId");

    if (
      typeof applicationId !== "string" ||
      !applicationId.trim()
    ) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url),
        303
      );
    }

    const trimmedApplicationId = applicationId.trim();

    // Verify that this application belongs to the signed-in user.
    const { data: application, error: fetchError } = await supabase
      .from("loan_applications")
      .select("id, status, answers")
      .eq("id", trimmedApplicationId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !application) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url),
        303
      );
    }

    // Only draft applications can be submitted.
    if (application.status !== "draft") {
      return NextResponse.redirect(
        new URL(`/applications/${trimmedApplicationId}`, request.url),
        303
      );
    }

    // Require application answers before final submission.
    if (
      !application.answers ||
      typeof application.answers !== "object" ||
      Array.isArray(application.answers) ||
      Object.keys(application.answers).length === 0
    ) {
      return NextResponse.redirect(
        new URL(
          `/applications/${trimmedApplicationId}?error=incomplete_application`,
          request.url
        ),
        303
      );
    }

    const { error: updateError } = await adminSupabase
      .from("loan_applications")
      .update({
        status: "submitted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", trimmedApplicationId)
      .eq("user_id", user.id)
      .eq("status", "draft");

    if (updateError) {
      console.error("Application submit error:", updateError);

      return NextResponse.redirect(
        new URL(
          `/applications/${trimmedApplicationId}/submit?error=submit_failed`,
          request.url
        ),
        303
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard", request.url),
      303
    );
  } catch (error) {
    console.error("Application submission error:", error);

    return NextResponse.redirect(
      new URL("/dashboard?error=submit_failed", request.url),
      303
    );
  }
}
