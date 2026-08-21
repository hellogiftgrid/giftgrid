"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const supabase = createClient();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const businessName = String(form.get("businessName") || "").trim();
    const fullName = String(form.get("fullName") || "").trim();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email,
          full_name: fullName,
          business_name: businessName,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    const params = new URLSearchParams({
      email,
    });

    router.push(`/auth/verify?${params.toString()}`);
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
        <AuthField
          label="Full Name"
          name="fullName"
          required
          autoComplete="name"
        />

        <AuthField
          label="Business Name"
          name="businessName"
          required
        />

        <AuthField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />

        <AuthField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

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
