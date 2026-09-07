"use client";

import { createClient } from "@/lib/supabase/client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f7fa]" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [supabase] = useState(() => createClient());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackError = searchParams.get("error");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError("");
  setLoading(true);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  // Check whether the user has a pending application
  const pendingApplication = sessionStorage.getItem(
    "pendingApplication"
  );

  if (pendingApplication) {
    try {
      const application = JSON.parse(pendingApplication);

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanType: application.loanType,
          answers: application.answers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to save your application."
        );
      }

      sessionStorage.removeItem("pendingApplication");
    } catch (applicationError) {
      console.error(
        "Application save error:",
        applicationError
      );

      setError(
        "You signed in successfully, but your application could not be saved. Please try again."
      );

      setLoading(false);
      return;
    }
  }

  router.push("/dashboard");
  router.refresh();
}

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#172033]">
      {/* Header */}
      <header className="border-b border-[#dfe4ec] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#1769e0]"
          >
            AMERISAVE
          </Link>
        </div>
      </header>

      <div className="flex justify-center px-5 py-10 md:py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium text-[#1769e0]">
              Secure Account Access
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Sign in
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#687386]">
              Sign in to continue to your loan dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe4ec] bg-white p-6 shadow-sm md:p-8">
            {callbackError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  We could not complete the authentication request.
                  Please try again.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#dfe4ec] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1769e0] focus:ring-2 focus:ring-[#1769e0]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#dfe4ec] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1769e0] focus:ring-2 focus:ring-[#1769e0]/10"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    alert("Password recovery will be connected next.")
                  }
                  className="text-sm font-medium text-[#1769e0] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1769e0] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f56c7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#dfe4ec]" />
              <span className="text-xs text-[#687386]">OR</span>
              <div className="h-px flex-1 bg-[#dfe4ec]" />
            </div>

            <p className="text-center text-sm text-[#687386]">
              Don&apos;t have an account?{" "}
              <Link
                href="/apply"
                className="font-semibold text-[#1769e0] hover:underline"
              >
                Get Started
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-[#687386]">
            Your account authentication is handled through the secure
            authentication service configured for this application.
          </p>
        </div>
      </div>
    </main>
  );
}