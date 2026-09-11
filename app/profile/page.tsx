"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setPhone(profile.phone || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router, supabase]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setMessage("Your profile has been updated.");
    setSaving(false);

    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </main>
    );
  }

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    email.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-[#dfe4ec] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="text-lg font-bold text-[#172033]"
          >
            GetSaved
          </Link>

          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#1769e0]"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1769e0]">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#172033]">
            Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your personal account information.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#dfe4ec] bg-white p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1769e0] text-xl font-bold text-white">
            {initials}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#172033]">
              {firstName || lastName
                ? `${firstName} ${lastName}`.trim()
                : "Account Holder"}
            </h2>

            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-[#dfe4ec] bg-white"
        >
          <div className="border-b border-[#dfe4ec] p-6">
            <h2 className="text-lg font-semibold text-[#172033]">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update the information associated with your account.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#172033]">
                First Name
              </label>

              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full rounded-xl border border-[#dfe4ec] px-4 py-3 outline-none focus:border-[#1769e0]"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#172033]">
                Last Name
              </label>

              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="w-full rounded-xl border border-[#dfe4ec] px-4 py-3 outline-none focus:border-[#1769e0]"
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#172033]">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-xl border border-[#dfe4ec] px-4 py-3 outline-none focus:border-[#1769e0]"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#172033]">
                Email
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-[#dfe4ec] bg-gray-50 px-4 py-3 text-gray-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                Email is managed through your authentication account.
              </p>
            </div>
          </div>

          {message && (
            <div className="mx-6 mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mx-6 mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end border-t border-[#dfe4ec] p-6">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#1769e0] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-2xl border border-[#dfe4ec] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#172033]">
            Security
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Password and authentication settings will be managed here.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-800">
          Development environment — profile changes are stored in the
          Supabase development database.
        </div>
      </div>
    </main>
  );
}