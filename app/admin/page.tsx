import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Dashboard — GiftGrid",
};

function StatCard({
  label,
  value,
  href,
  tone = "indigo",
}: {
  label: string;
  value: number;
  href: string;
  tone?: string;
}) {
  const toneClasses =
    tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : tone === "green"
        ? "bg-emerald-50 text-emerald-700"
        : tone === "red"
          ? "bg-red-50 text-red-700"
          : "bg-indigo-50 text-[#4F46E5]";

  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`inline-flex rounded-xl px-3 py-1 text-xs font-bold ${toneClasses}`}
      >
        Live
      </div>

      <div className="mt-5 text-3xl font-bold text-slate-950">
        {value}
      </div>

      <div className="mt-1 text-sm font-semibold text-slate-500">
        {label}
      </div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    applications,
    merchants,
    audits,
    opportunities,
    submissions,
    threads,
    tickets,
    documents,
  ] = await Promise.all([
    supabase
      .from("merchant_applications")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "needs_info"]),

    supabase
      .from("merchant_profiles")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("audits")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "approved"]),

    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("active", true),

    supabase
      .from("opportunity_submissions")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "waiting"]),

    supabase
      .from("message_threads")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),

    supabase
      .from("documents")
      .select("id", { count: "exact", head: true }),
  ]);

  const errors = [
    applications.error,
    merchants.error,
    audits.error,
    opportunities.error,
    submissions.error,
    threads.error,
    tickets.error,
    documents.error,
  ].filter(Boolean);

  const systemWarning =
    errors.length > 0
      ? "One or more admin metrics could not be loaded. Check the Supabase RLS/schema configuration."
      : null;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
          Overview
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          GiftGrid Admin Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          Run merchant applications, audits, opportunities, communications,
          support and website operations from one place.
        </p>
      </div>

      {systemWarning && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
          {systemWarning}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Applications needing attention"
          value={applications.count ?? 0}
          href="/admin/applications"
          tone="amber"
        />

        <StatCard
          label="Merchants"
          value={merchants.count ?? 0}
          href="/admin/merchants"
          tone="green"
        />

        <StatCard
          label="Audits"
          value={audits.count ?? 0}
          href="/admin/audits"
        />

        <StatCard
          label="Open support tickets"
          value={tickets.count ?? 0}
          href="/admin/support"
          tone="red"
        />

        <StatCard
          label="Active opportunities"
          value={opportunities.count ?? 0}
          href="/admin/opportunities"
          tone="green"
        />

        <StatCard
          label="Opportunity submissions"
          value={submissions.count ?? 0}
          href="/admin/opportunities"
        />

        <StatCard
          label="Merchant message threads"
          value={threads.count ?? 0}
          href="/admin/messages"
        />

        <StatCard
          label="Documents"
          value={documents.count ?? 0}
          href="/admin/content"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Operations
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Review Applications", "/admin/applications"],
              ["Review Audits", "/admin/audits"],
              ["Manage Merchants", "/admin/merchants"],
              ["Manage Opportunities", "/admin/opportunities"],
              ["Open Messages", "/admin/messages"],
              ["Handle Support", "/admin/support"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border border-slate-200 px-4 py-4 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#4F46E5]"
              >
                {label}
                <span className="ml-2">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
            Admin principle
          </div>

          <h2 className="mt-3 text-xl font-bold">
            Human review stays in control.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            AI can generate audit analysis and recommendations, but the Admin
            team controls what becomes an official GiftGrid result.
          </p>

          <Link
            href="/admin/audits"
            className="mt-5 inline-flex rounded-xl bg-[#4F46E5] px-4 py-3 text-sm font-bold text-white hover:bg-[#4338CA]"
          >
            Open Audit Queue
          </Link>
        </section>
      </div>
    </div>
  );
}
