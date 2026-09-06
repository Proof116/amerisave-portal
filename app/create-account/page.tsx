"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f7fa]" />}>
      <CreateAccountForm />
    </Suspense>
  );
}

function CreateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [supabase] = useState(() => createClient());

  const loanType = searchParams.get("loanType");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function savePendingApplication() {
    const pendingApplication =
      sessionStorage.getItem("pendingApplication");

    if (!pendingApplication) {
      return true;
    }

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

      return true;
    } catch (applicationError) {
      console.error(
        "Pending application save error:",
        applicationError
      );

      setError(
        "Your account is verified, but we could not save your application. Please try again."
      );

      return false;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted || !session) {
        return;
      }

      const saved = await savePendingApplication();

      if (!saved || !mounted) {
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || !session) {
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED"
      ) {
        const saved = await savePendingApplication();

        if (!saved || !mounted) {
          return;
        }

        router.replace("/dashboard");
        router.refresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      const saved = await savePendingApplication();

      if (!saved) {
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setMessage(
      "Account created. Please check your email to verify your account."
    );
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#dfe4ec] bg-white p-8 shadow-sm">
          <div className="mb-8">
            <Link
              href="/"
              className="text-2xl font-bold tracking-[0.22em] text-[#1769e0]"
            >
              AMERISAVE
            </Link>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#172033]">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#687386]">
              Create an account to continue with your loan application.
            </p>
          </div>

          {loanType && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              You are applying for a{" "}
              {loanType === "home" ? "home" : "personal"} loan.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-[#172033]"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-[#cfd6e2] px-4 py-3 outline-none transition focus:border-[#1769e0]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-[#172033]"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-[#cfd6e2] px-4 py-3 outline-none transition focus:border-[#1769e0]"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#172033]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-[#cfd6e2] px-4 py-3 outline-none transition focus:border-[#1769e0]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#172033]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-[#cfd6e2] px-4 py-3 outline-none transition focus:border-[#1769e0]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-[#172033]"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-[#cfd6e2] px-4 py-3 outline-none transition focus:border-[#1769e0]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#1769e0] px-5 py-3 font-semibold text-white transition hover:bg-[#1258bd] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#687386]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#1769e0] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}