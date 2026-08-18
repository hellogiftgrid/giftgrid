
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
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
    const password = form.get("password") as string;
    const businessName = form.get("businessName") as string;
    const fullName = form.get("fullName") as string;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // profiles row is expected to be created by a DB trigger on auth.users insert
    // (see docs/database.md — "handle_new_user" trigger, to be added in a later migration).
    // Once that trigger exists, insert the merchant_profiles row here:
    if (data.user) {
      await supabase.from("merchant_profiles").insert({
        profile_id: data.user.id,
        business_name: businessName,
        contact_email: email,
      });
    }

    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="We sent a confirmation link to finish setting up your account.">
        <p className="text-[14px] text-textSecondary">
          Once confirmed, you can sign in and start your merchant application.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Apply as a merchant"
      subtitle="Create an account to start your application."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-accent">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Full Name" name="fullName" required autoComplete="name" />
        <AuthField label="Business Name" name="businessName" required />
        <AuthField label="Email" name="email" type="email" required autoComplete="email" />
        <AuthField label="Password" name="password" type="password" required autoComplete="new-password" />

        {error && <p className="text-[13.5px] text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[3px] bg-accent px-6 py-3 text-[14.5px] font-semibold text-primary transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
}
