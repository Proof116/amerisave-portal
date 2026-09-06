import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/login?error=auth_callback_missing_code",
        requestUrl.origin
      )
    );
  }

  try {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error(
        "AUTH CALLBACK EXCHANGE ERROR:",
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
      new URL(next, requestUrl.origin)
    );
  } catch (error) {
    console.error("AUTH CALLBACK ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Authentication callback failed.";

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(message)}`,
        requestUrl.origin
      )
    );
  }
}