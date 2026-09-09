import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import ThemeToggle from "@/components/shared/ThemeToggle";

export const dynamic = "force-dynamic";

const navigation = [
  ["Overview", "/console"],
  ["Apps / Projects", "/console/apps"],
  ["Sandbox", "/console/sandbox"],
  ["API keys", "/console/keys"],
  ["Webhooks", "/console/webhooks"],
  ["Cron jobs", "/console/cron"],
  ["Usage & logs", "/console/usage"],
  ["Docs", "/docs"],
] as const;

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="console-shell min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#10172b] p-5 lg:block">
          <Link href="/console" className="block border-b border-white/10 pb-6">
            <div className="text-lg font-bold tracking-tight">GiftGrid Console</div>
            <div className="mt-1 text-xs text-slate-400">Developer platform</div>
          </Link>
          <nav className="mt-6 space-y-1">
            {navigation.map(([label, href]) => (
              <Link key={href} href={href} className="block rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5 lg:px-10">
            <div><div className="text-xs uppercase tracking-[0.18em] text-indigo-300">Developer workspace</div><div className="mt-1 text-sm text-slate-300">{user.email}</div></div>
            <div className="flex items-center gap-3"><ThemeToggle /><Link href="/docs" className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">API docs</Link><Link href="/auth/sign-out" className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900">Sign out</Link></div>
          </header>
          <div className="border-b border-white/10 px-5 py-3 lg:hidden"><div className="flex gap-2 overflow-x-auto">{navigation.map(([label, href]) => <Link key={href} href={href} className="whitespace-nowrap rounded-md bg-white/10 px-3 py-2 text-xs text-slate-200">{label}</Link>)}</div></div>
          <div className="px-5 py-8 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
