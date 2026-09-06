"use client";

import { FormEvent, Suspense, useState } from "react";
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

  const supabase = createClient();

  const loanType = searchParams.get("loanType");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (data.session) {
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
          result.error || "Unable to save application."
        );
      }

      sessionStorage.removeItem("pendingApplication");
    } catch (applicationError) {
      console.error(applicationError);

      setError(
        "Your account was created, but we could not save your application. Please try again from the dashboard."
      );

      return;
    }
  }

  router.push("/dashboard");
} else {
  setMessage(
    "Account created. Please check your email to confirm your account."
  );
}

    setLoading(false);
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
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium text-[#1769e0]">
              Create your account
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Let&apos;s get your account set up
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#687386]">
              Create a secure account to continue your loan application.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe4ec] bg-white p-6 shadow-sm md:p-8">
            {loanType && (
              <div className="mb-6 rounded-xl bg-[#eef5ff] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1769e0]">
                  Application Type
                </p>

                <p className="mt-1 text-sm font-medium">
                  {loanType === "home"
                    ? "Home Loan"
                    : "Personal Loan"}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  id="firstName"
                  label="First Name"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="First name"
                />

                <InputField
                  id="lastName"
                  label="Last Name"
                  value={lastName}
                  onChange={setLastName}
                  placeholder="Last name"
                />
              </div>

              <InputField
                id="email"
                label="Email Address"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                type="email"
              />

              <InputField
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="At least 8 characters"
                type="password"
              />

              <InputField
                id="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Enter password again"
                type="password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1769e0] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f56c7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#687386]">
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
        </div>
      </div>
    </main>
  );
}

function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        autoComplete={
          type === "password"
            ? id === "password"
              ? "new-password"
              : "new-password"
            : id === "email"
              ? "email"
              : "given-name"
        }
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#dfe4ec] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1769e0] focus:ring-2 focus:ring-[#1769e0]/10"
      />
    </div>
  );
}