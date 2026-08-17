"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="If an account exists for that address, we've sent a reset link." />
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/auth/sign-in" className="text-accent">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Email" name="email" type="email" required autoComplete="email" />

        {error && <p className="text-[13.5px] text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[3px] bg-accent px-6 py-3 text-[14.5px] font-semibold text-primary transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send Reset Link"}
        </button>
      </form>
    </AuthShell>
  );
}
