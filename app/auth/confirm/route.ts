import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  if (!tokenHash || type !== "email") {
    return NextResponse.redirect(
      new URL(
        "/login?error=invalid_email_confirmation",
        requestUrl.origin
      )
    );
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    if (error) {
      console.error(
        "EMAIL CONFIRMATION ERROR:",
        error.message
      );

      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(error.message)}`,
          requestUrl.origin
        )
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard", requestUrl.origin)
    );
  } catch (error) {
    console.error("EMAIL CONFIRMATION EXCEPTION:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Email confirmation failed.";

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(message)}`,
        requestUrl.origin
      )
    );
  }
}