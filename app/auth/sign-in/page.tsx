
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setLoading(false);
      setError("Enter your email and password.");
      return;
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.session) {
      setError(
        "Sign-in did not create a session. Please confirm your email address and try again."
      );
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    router.replace(profile?.role === "corporate_buyer" ? "/buyer/dashboard" : "/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your GiftGrid workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="text-accent">
            Apply as a merchant
          </Link>
          {" "}or{" "}
          <Link href="/buyers/apply" className="text-accent">
            start a gifting request
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Email" name="email" type="email" required autoComplete="email" />
        <AuthField label="Password" name="password" type="password" required autoComplete="current-password" />

        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-[13px] text-textSecondary hover:text-accent">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-[13.5px] text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 px-6 py-3.5 text-[14.5px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}
