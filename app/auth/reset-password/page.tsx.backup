"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [recovery, setRecovery] = useState(false);
  const [checking, setChecking] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setRecovery(true);
      } else {
        setError(
          "This password reset link is invalid or has expired. Please request a new one."
        );
      }

      setChecking(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setRecovery(true);
          setChecking(false);
          setError("");
        }
      }
    );

    checkRecoverySession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const newPassword = password.trim();
    const repeatedPassword = confirmPassword.trim();

    if (newPassword.length < 6) {
      setError(
        "Your password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== repeatedPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);

      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.replace("/auth/sign-in");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error("Password update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your password."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <AuthShell
        title="Reset your password"
        subtitle="Checking your secure reset link..."
      >
        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
      </AuthShell>
    );
  }

  if (!recovery) {
    return (
      <AuthShell
        title="Reset link expired"
        subtitle="Your password reset link is no longer valid."
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
            Request a new password reset link and use the
            newest email.
          </div>

          <Link
            href="/auth/forgot-password"
            className="block w-full rounded-xl bg-accent px-6 py-3 text-center text-sm font-semibold text-primary"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell
        title="Password updated"
        subtitle="Your GiftGrid password has been changed successfully."
      >
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
          Your password has been updated. Redirecting you to
          sign in...
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create a new password"
      subtitle="Choose a new password for your GiftGrid merchant account."
      footer={
        <Link
          href="/dashboard"
          className="text-accent"
        >
          Back to dashboard
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="new-password"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            New Password
          </label>

          <input
            id="new-password"
            name="new-password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="new-password"
            required
            minLength={6}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Confirm New Password
          </label>

          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            autoComplete="new-password"
            required
            minLength={6}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <p className="text-xs text-slate-400">
          Use at least 6 characters.
        </p>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            password.length < 6 ||
            confirmPassword.length < 6
          }
          className="w-full rounded-xl bg-[#4F46E5] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Updating password..."
            : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
