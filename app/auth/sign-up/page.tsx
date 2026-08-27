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

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const fullName = String(
      form.get("fullName") || ""
    ).trim();

    const businessName = String(
      form.get("businessName") || ""
    ).trim();

    const email = String(
      form.get("email") || ""
    ).trim().toLowerCase();

    const password = String(
      form.get("password") || ""
    );

    if (!fullName || !businessName || !email || !password) {
      setLoading(false);
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              business_name: businessName,
            },
          },
        });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!data.user) {
        setError(
          "GiftGrid could not create your account. Please try again."
        );
        return;
      }

      /*
       * Supabase may return:
       * - a user + session when email confirmation is disabled
       * - a user + no session when email confirmation is required
       */

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setMessage(
        "Your account was created. Check your email for the confirmation code."
      );

      router.replace(
        `/auth/verify?email=${encodeURIComponent(email)}`
      );
    } catch (err) {
      console.error("GiftGrid signup error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Apply as a merchant"
      subtitle="Create your GiftGrid merchant account."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-accent"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
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
          autoComplete="organization"
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
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading
            ? "Creating account..."
            : "Create Account"}
        </button>

        <p className="text-center text-xs leading-5 text-slate-400">
          By creating an account, you agree to GiftGrid&apos;s
          terms and privacy policy.
        </p>
      </form>
    </AuthShell>
  );
}
