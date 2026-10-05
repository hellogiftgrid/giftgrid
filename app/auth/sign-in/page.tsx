"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AccountChoice, { type AccountType } from "@/components/auth/AccountChoice";
import { createClient } from "@/lib/supabase/client";
import { signInDestination } from "@/lib/auth/destination";
export default function SignInPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [account, setAccount] = useState<AccountType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null); setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const email = String(form.get("email") || "").trim().toLowerCase();
      const password = String(form.get("password") || "");
      if (!email || !password) { setError("Enter your email and password."); return; }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      if (!data.session || !data.user) { setError("Please confirm your email address, then sign in again."); return; }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profileError) { setError("You're signed in, but your workspace could not be loaded. Please try again."); return; }
      // Account selection never grants or changes a stored role.
      router.replace(signInDestination(profile?.role, new URLSearchParams(window.location.search).get("next") || ""));
      router.refresh();
    } catch { setError("We couldn't connect. Check your connection and try again."); }
    finally { setLoading(false); }
  }
  return <AuthShell title={showForm ? "Welcome back." : "Good to see you again."} subtitle={showForm ? "Sign in to continue your GiftGrid journey." : "A thoughtful gift. A new connection. Your next opportunity starts here."} footer={<>New to GiftGrid? <Link href="/auth/join" className="font-semibold text-blue-700 underline underline-offset-4">Create an account</Link></>}>
    {!showForm ? <>
      <AccountChoice value={account} onChange={setAccount} />
      <button type="button" disabled={!account} onClick={() => setShowForm(true)} className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{account ? `Continue as a ${account}` : "Choose your account type"}</button>
      <button type="button" onClick={() => { setAccount(null); setShowForm(true); }} className="mt-4 w-full py-2 text-xs font-medium text-slate-500 underline underline-offset-4">GiftGrid team or developer? Sign in here</button>
    </> : <>
      <div className="mb-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold capitalize text-slate-700">{account || "Team"} workspace</span><button type="button" disabled={loading} onClick={() => { setShowForm(false); setError(null); }} className="px-2 py-1 font-semibold text-blue-700">Change</button></div>
      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
        <AuthField label="Email address" name="email" type="email" required autoComplete="email" />
        <div><AuthField label="Password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" /><div className="mt-2 flex items-center justify-between"><button type="button" onClick={() => setShowPassword(value => !value)} aria-pressed={showPassword} className="py-2 text-xs font-medium text-slate-600">{showPassword ? "Hide password" : "Show password"}</button><Link href="/auth/forgot-password" className="py-2 text-xs font-semibold text-blue-700">Forgot password?</Link></div></div>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </>}
  </AuthShell>;
}
