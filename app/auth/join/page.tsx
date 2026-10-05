"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import AccountChoice, { type AccountType } from "@/components/auth/AccountChoice";
export default function JoinPage() {
  const [account, setAccount] = useState<AccountType | null>(null);
  const router = useRouter();
  return <AuthShell title="A place for your next opportunity." subtitle="Join a community of thoughtful buyers and independent brands." footer={<>Already part of GiftGrid? <Link href="/auth/sign-in" className="font-semibold text-blue-700 underline underline-offset-4">Sign in</Link></>}>
    <AccountChoice value={account} onChange={setAccount} />
    <button type="button" disabled={!account} onClick={() => router.push(account === "buyer" ? "/buyers/apply" : "/auth/sign-up")} className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{account ? `Join as a ${account}` : "Choose an account to continue"}</button>
    <p className="mt-4 text-center text-xs leading-6 text-slate-500">Explore the <Link href="/market" className="underline underline-offset-4">marketplace</Link> before creating an account.</p>
  </AuthShell>;
}
