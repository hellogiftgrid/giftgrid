"use client";

import {
  Suspense,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";

function VerifyForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email) {
      router.replace("/auth/sign-up");
    }
  }, [email, router]);

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    const token = code.replace(/\D/g, "");

    if (token.length !== 6) {
      setError("Enter the 6-digit confirmation code.");
      return;
    }

    setLoading(true);

    const { data, error: verifyError } =
      await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: "email",
      });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    if (!data.session) {
      setError(
        "Your email was verified, but no session was created. Please sign in."
      );
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function resendCode() {
    setError("");
    setMessage("");

    if (!email) {
      setError("Email address is missing. Please start signup again.");
      return;
    }

    setResending(true);

    try {
      const { data, error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      console.log("Supabase resend response:", {
        data,
        error: resendError,
      });

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setMessage("A new confirmation code has been sent.");
    } catch (err) {
      console.error("Resend confirmation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend confirmation code."
      );
    } finally {
      setResending(false);
    }
  }

  if (!email) return null;

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${email}.`}
      footer={
        <>
          Wrong email?{" "}
          <Link href="/auth/sign-up" className="text-accent">
            Create a new account
          </Link>
        </>
      }
    >
      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label
            htmlFor="code"
            className="mb-2 block text-sm font-semibold text-textPrimary"
          >
            Confirmation code
          </label>

          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            className="w-full rounded-xl border border-slate-200 px-4 py-4 text-center text-2xl font-bold tracking-[0.4em] text-slate-900 outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
          />
        </div>

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
          disabled={loading || code.length !== 6}
          className="w-full rounded-xl bg-[#4F46E5] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify email"}
        </button>

        <button
          type="button"
          onClick={resendCode}
          disabled={resending}
          className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend confirmation code"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Verify your email"
          subtitle="Loading verification…"
        >
          <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
        </AuthShell>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
