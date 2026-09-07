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
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");

  if (!applicationId) {
    return NextResponse.json(
      { error: "Application ID is required." },
      { status: 400 },
    );
  }

  const { data: application, error: applicationError } =
    await supabase
      .from("loan_applications")
      .select("id")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (applicationError) {
    console.error(
      "Unable to verify application ownership:",
      applicationError,
    );

    return NextResponse.json(
      { error: "Unable to load application." },
      { status: 500 },
    );
  }

  if (!application) {
    return NextResponse.json(
      { error: "Application not found." },
      { status: 404 },
    );
  }

  const { data: verification, error: verificationError } =
    await supabase
      .from("application_verifications")
      .select(
        [
          "id",
          "application_id",
          "identity_status",
          "ssn_last4",
          "bank_status",
          "bank_account_last4",
          "bank_routing_last4",
          "verification_provider",
          "verified_at",
          "created_at",
          "updated_at",
        ].join(", "),
      )
      .eq("application_id", applicationId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (verificationError) {
    console.error(
      "Unable to load verification status:",
      verificationError,
    );

    return NextResponse.json(
      { error: "Unable to load verification status." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    verification: verification ?? {
      identity_status: "not_started",
      ssn_last4: null,
      bank_status: "not_started",
      bank_account_last4: null,
      bank_routing_last4: null,
      verification_provider: null,
      verified_at: null,
    },
  });
}