/**
 * /app/console/page.tsx
 *
 * GiftGrid Developer Console — Home
 * Live at: degiftgrid.com/console
 *
 * Layers:
 *   Layer 1 — Overview    : stats, environment switcher, quick links
 *   Layer 2 — API Keys    : /console/keys
 *   Layer 3 — Webhooks    : /console/webhooks
 *   Layer 4 — Sandbox     : /console/sandbox
 *   Layer 5 — Docs        : /console/docs
 *   Layer 6 — Logs        : /console/logs
 *
 * Access: role = "developer" | "super_admin"
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Developer Console — GiftGrid",
  description: "Build on the GiftGrid platform. Manage API keys, webhooks, sandbox, and integrations.",
};

const LAYERS = [
  {
    href: "/console/keys",
    icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
    title: "API Keys",
    desc: "Create, rotate, and revoke scoped credentials for sandbox and production.",
    badge: "Layer 2",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    href: "/console/webhooks",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    title: "Webhooks",
    desc: "Receive signed event notifications and verify every delivery before processing.",
    badge: "Layer 3",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    href: "/console/sandbox",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    title: "Sandbox",
    desc: "Test webhooks, automations, and merchant workflows with isolated test data.",
    badge: "Layer 4",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    href: "/console/docs",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    title: "API Docs",
    desc: "Full reference for authentication, scopes, endpoints, retries, and the changelog.",
    badge: "Layer 5",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    href: "/console/logs",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "Logs",
    desc: "Live request logs, error traces, and webhook delivery history.",
    badge: "Layer 6",
    color: "bg-slate-50 text-slate-700 border-slate-200",
  },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default async function ConsolePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const isDev =
    profile?.role === "developer" ||
    profile?.role === "super_admin";

  if (!isDev) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-10">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Developer Console</h1>
          <p className="mt-1 text-sm text-slate-500">
            Build, test, and manage your GiftGrid integrations.
          </p>
        </div>
        {/* Environment pill */}
        <EnvironmentSwitcher />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "API Requests today", value: "—" },
          { label: "Active webhooks", value: "—" },
          { label: "Sandbox calls", value: "—" },
          { label: "Last error", value: "None" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Layer cards */}
      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          Console Layers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LAYERS.map((layer) => (
            <Link
              key={layer.href}
              href={layer.href}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${layer.color}`}>
                  {layer.badge}
                </span>
                <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500">
                  →
                </span>
              </div>
              <div className={`w-fit rounded-xl border p-2.5 ${layer.color}`}>
                <Icon d={layer.icon} />
              </div>
              <div>
                <p className="font-bold text-slate-950">{layer.title}</p>
                <p className="mt-1 text-sm text-slate-500">{layer.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick-start code block */}
      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Quick start
        </p>
        <pre className="overflow-x-auto text-sm leading-7 text-slate-100">
{`curl https://api.degiftgrid.com/v1/merchants \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "GiftGrid-Environment: sandbox"`}
        </pre>
      </div>

      {/* Docs link */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-800">
          New to the GiftGrid API?
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          Start with Authentication, then explore Scopes to understand what each key can access.
        </p>
        <Link
          href="/console/docs/getting-started"
          className="mt-3 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Read Getting Started →
        </Link>
      </div>
    </div>
  );
}

/** Toggle between Sandbox and Production */
function EnvironmentSwitcher() {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
        Sandbox
      </span>
      <span className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-50 cursor-pointer">
        Production
      </span>
    </div>
  );
}
