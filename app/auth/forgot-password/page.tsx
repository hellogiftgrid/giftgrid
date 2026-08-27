"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSent(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo:
            `${window.location.origin}/auth/reset-password`,
        });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch (err) {
      console.error("Password reset error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the password reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a secure password reset link."
      footer={
        <>
          Remember your password?{" "}
          <Link
            href="/auth/sign-in"
            className="text-accent"
          >
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
            Check your email for a password reset link. Open the
            newest email to continue.
          </div>

          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError("");
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Send another reset email
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="reset-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email
            </label>

            <input
              id="reset-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
