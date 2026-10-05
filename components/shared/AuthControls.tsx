"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/use-session";
import SignOutButton from "./SignOutButton";
export default function AuthControls() {
  const { signedIn, loading } = useSession();
  const pathname = usePathname();
  if (loading) return <span className="px-3 text-xs text-slate-500" role="status">Checking account...</span>;
  return signedIn ? <div className="flex items-center gap-1"><Link href="/dashboard" className="rounded-lg px-3 py-3 text-sm font-semibold text-blue-700">Dashboard</Link><SignOutButton /></div> : <Link href={"/auth/sign-in?next=" + encodeURIComponent(pathname === "/community" || pathname === "/giftgrid" ? "/" : pathname)} className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Sign in</Link>;
}
