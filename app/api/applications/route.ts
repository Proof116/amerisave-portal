import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type LoanType = "home" | "personal";

const ALLOWED_ANSWER_KEYS = new Set([
  "purpose",
  "employment",
  "loanAmount",
  "incomeRange",
]);

const MAX_BODY_SIZE = 50_000;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Require an authenticated customer.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "You must be signed in to submit an application.",
        },
        { status: 401 }
      );
    }

    // Prevent unexpectedly large request bodies.
    const contentLength = request.headers.get("content-length");

    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        {
          error: "Application data is too large.",
        },
        { status: 413 }
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          error: "Invalid application data.",
        },
        { status: 400 }
      );
    }

    const { loanType, answers } = body as {
      loanType?: unknown;
      answers?: unknown;
    };

    // Validate loan type.
    if (loanType !== "home" && loanType !== "personal") {
      return NextResponse.json(
        {
          error: "Invalid loan type.",
        },
        { status: 400 }
      );
    }

    // Validate answers object.
    if (
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return NextResponse.json(
        {
          error: "Application answers are required.",
        },
        { status: 400 }
      );
    }

    const rawAnswers = answers as Record<string, unknown>;

    // Reject unexpected fields.
    const unexpectedKeys = Object.keys(rawAnswers).filter(
      (key) => !ALLOWED_ANSWER_KEYS.has(key)
    );

    if (unexpectedKeys.length > 0) {
      return NextResponse.json(
        {
          error: "Application contains unsupported fields.",
        },
        { status: 400 }
      );
    }

    // Validate individual values.
    for (const [key, value] of Object.entries(rawAnswers)) {
      if (typeof value !== "string") {
        return NextResponse.json(
          {
            error: `Invalid value for ${key}.`,
          },
          { status: 400 }
        );
      }

      if (value.length > 1_000) {
        return NextResponse.json(
          {
            error: `Value for ${key} is too long.`,
          },
          { status: 400 }
        );
      }
    }

    // Validate loan amount when supplied.
    if (rawAnswers.loanAmount) {
      const loanAmount = Number(rawAnswers.loanAmount);

      if (
        !Number.isFinite(loanAmount) ||
        loanAmount <= 0 ||
        loanAmount > 100_000_000
      ) {
        return NextResponse.json(
          {
            error: "Invalid loan amount.",
          },
          { status: 400 }
        );
      }
    }

    // Save application.
    const { data, error } = await supabase
      .from("loan_applications")
      .insert({
        user_id: user.id,
        loan_type: loanType as LoanType,
        status: "draft",
        answers: rawAnswers,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Application insert error:", error);

      return NextResponse.json(
        {
          error: "Unable to save application.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      applicationId: data.id,
    });
  } catch (error) {
    console.error("Application API error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while saving the application.",
      },
      { status: 500 }
    );
  }
}
