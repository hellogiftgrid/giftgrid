import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Dashboard — GiftGrid",
};

type Merchant = {
  id: string;
  business_name: string;
  contact_email: string;
  created_at: string;
};

type Application = {
  id: string;
  status: string;
  submitted_at: string;
  merchant: {
    business_name: string;
    contact_email: string;
  } | null;
  store: {
    store_url: string;
    platform: string | null;
  } | null;
};

type Audit = {
  id: string;
  status: string;
  overall_score: number | null;
  created_at: string;
  merchant_name: string;
  store_url: string;
};

type Opportunity = {
  id: string;
  company_name: string;
  category: string;
  active: boolean;
  public_display: boolean;
  created_at: string;
};

type SupportTicket = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  merchant: {
    business_name: string;
    contact_email: string;
  } | null;
};

function StatCard({
  label,
  value,
  href,
  tone = "indigo",
  detail,
}: {
  label: string;
  value: number;
  href: string;
  tone?: "indigo" | "green" | "amber" | "red";
  detail?: string;
}) {
  const classes = {
    indigo: "bg-indigo-50 text-[#4F46E5]",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold ${classes[tone]}`}
      >
        Live
      </div>

      <div className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </div>

      <div className="mt-1 text-sm font-semibold text-slate-600">
        {label}
      </div>

      {detail && (
        <div className="mt-2 text-xs text-slate-400">
          {detail}
        </div>
      )}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let classes = "bg-slate-100 text-slate-600";

  if (
    ["approved", "published", "accepted", "active", "completed"].includes(
      normalized
    )
  ) {
    classes = "bg-emerald-50 text-emerald-700";
  } else if (
    ["submitted", "under_review", "admin_review", "running", "open"].includes(
      normalized
    )
  ) {
    classes = "bg-amber-50 text-amber-700";
  } else if (
    ["rejected", "failed", "archived", "closed"].includes(normalized)
  ) {
    classes = "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${classes}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    merchantsRes,
    applicationsRes,
    auditsRes,
    opportunitiesRes,
    submissionsRes,
    threadsRes,
    ticketsRes,
    documentsRes,
  ] = await Promise.all([
    supabase
      .from("merchant_profiles")
      .select("id, business_name, contact_email, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("merchant_applications")
      .select(
        "id, status, submitted_at, merchant:merchant_profiles(business_name, contact_email), store:stores(store_url, platform)"
      )
      .order("submitted_at", { ascending: false }),

    supabase
      .from("audits")
      .select(
        "id, status, overall_score, created_at, store_id, merchant_id"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("opportunities")
      .select(
        "id, company_name, category, active, public_display, created_at"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("opportunity_submissions")
      .select("id, status, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("message_threads")
      .select("id, subject, merchant_id, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("support_tickets")
      .select(
        "id, subject, status, created_at, merchant:merchant_profiles(business_name, contact_email)"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("documents")
      .select("id, title, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const errors = [
    merchantsRes.error,
    applicationsRes.error,
    auditsRes.error,
    opportunitiesRes.error,
    submissionsRes.error,
    threadsRes.error,
    ticketsRes.error,
    documentsRes.error,
  ].filter(Boolean);

  const merchants = (merchantsRes.data ?? []) as Merchant[];
  const applications = (applicationsRes.data ?? []) as Application[];
  const opportunities = (opportunitiesRes.data ?? []) as Opportunity[];
  const submissions = submissionsRes.data ?? [];
  const threads = threadsRes.data ?? [];
  const tickets = (ticketsRes.data ?? []) as SupportTicket[];
  const documents = documentsRes.data ?? [];

  /*
   * Audits need merchant/store names.
   * We load the IDs first, then resolve the related records.
   */
  const rawAudits = auditsRes.data ?? [];

  const auditStoreIds = [
    ...new Set(
      rawAudits
        .map((audit) => audit.store_id)
        .filter(Boolean)
    ),
  ];

  const auditMerchantIds = [
    ...new Set(
      rawAudits
        .map((audit) => audit.merchant_id)
        .filter(Boolean)
    ),
  ];

  const [{ data: auditStores }, { data: auditMerchants }] =
    await Promise.all([
      auditStoreIds.length
        ? supabase
            .from("stores")
            .select("id, store_url, merchant_id")
            .in("id", auditStoreIds)
        : Promise.resolve({ data: [] }),

      auditMerchantIds.length
        ? supabase
            .from("merchant_profiles")
            .select("id, business_name")
            .in("id", auditMerchantIds)
        : Promise.resolve({ data: [] }),
    ]);

  const storeMap = new Map(
    (auditStores ?? []).map((store) => [store.id, store])
  );

  const merchantMap = new Map(
    (auditMerchants ?? []).map((merchant) => [merchant.id, merchant])
  );

  const audits: Audit[] = rawAudits.map((audit) => {
    const store = storeMap.get(audit.store_id);
    const merchant = merchantMap.get(audit.merchant_id);

    return {
      id: audit.id,
      status: audit.status,
      overall_score: audit.overall_score,
      created_at: audit.created_at,
      merchant_name:
        merchant?.business_name ?? "Unknown merchant",
      store_url:
        store?.store_url ?? "Store URL unavailable",
    };
  });

  /*
   * Real status calculations.
   * We deliberately calculate these from actual rows instead
   * of assuming a single historic enum shape.
   */

  const applicationsAttention = applications.filter((item) =>
    ["submitted", "under_review", "needs_info"].includes(
      item.status
    )
  );

  const auditsAwaitingReview = audits.filter((item) =>
    ["pending", "running", "admin_review", "draft"].includes(
      item.status
    )
  );

  const publishedAudits = audits.filter((item) =>
    ["published", "approved"].includes(item.status)
  );

  const activeOpportunities = opportunities.filter(
    (item) => item.active
  );

  const openTickets = tickets.filter(
    (item) => !["closed", "resolved"].includes(
      item.status.toLowerCase()
    )
  );

  const submittedOpportunities = submissions.filter((item: any) =>
    ["submitted", "under_review", "waiting"].includes(
      item.status
    )
  );

  const recentApplications = applications.slice(0, 5);
  const recentAudits = audits.slice(0, 5);
  const recentTickets = tickets.slice(0, 5);
  const recentMerchants = merchants.slice(0, 5);

  const systemWarning =
    errors.length > 0
      ? "Some live metrics could not be loaded. Check your Supabase permissions or schema."
      : null;

  return (
    <div className="mx-auto max-w-7xl">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            GiftGrid Admin
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Real-time operational view of merchants, applications,
            audits, opportunities and support.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
          Data source: Supabase
        </div>
      </div>

      {systemWarning && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
          {systemWarning}
        </div>
      )}

      {/* LIVE STATS */}
      <section>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total merchants"
            value={merchants.length}
            href="/admin/merchants"
            tone="green"
            detail="All merchant profiles"
          />

          <StatCard
            label="Applications needing attention"
            value={applicationsAttention.length}
            href="/admin/applications"
            tone="amber"
            detail="Submitted / review / information"
          />

          <StatCard
            label="Audits awaiting review"
            value={auditsAwaitingReview.length}
            href="/admin/audits"
            tone="amber"
            detail="Not yet finalized"
          />

          <StatCard
            label="Published audits"
            value={publishedAudits.length}
            href="/admin/audits"
            tone="green"
            detail="Merchant-visible results"
          />

          <StatCard
            label="Active opportunities"
            value={activeOpportunities.length}
            href="/admin/opportunities"
            tone="green"
          />

          <StatCard
            label="Opportunity submissions"
            value={submittedOpportunities.length}
            href="/admin/opportunities"
            tone="indigo"
            detail="Active submissions"
          />

          <StatCard
            label="Open support tickets"
            value={openTickets.length}
            href="/admin/support"
            tone="red"
          />

          <StatCard
            label="Conversations"
            value={threads.length}
            href="/admin/messages"
            tone="indigo"
            detail="Merchant message threads"
          />
        </div>
      </section>

      {/* OPERATIONS */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-950">
                Applications needing attention
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Live from merchant_applications
              </p>
            </div>

            <Link
              href="/admin/applications"
              className="text-xs font-bold text-[#4F46E5] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {!recentApplications.length ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                No applications yet.
              </div>
            ) : (
              recentApplications.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-950">
                      {item.merchant?.business_name ??
                        "Unnamed merchant"}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {item.merchant?.contact_email ?? ""}
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      {item.store?.store_url ??
                        "No store URL"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />

                    <span className="text-xs text-slate-400">
                      {formatDate(item.submitted_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
            Audit operations
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Keep the AI review human-controlled.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            AI can prepare evidence, findings and recommendations.
            Admin decides what becomes an official GiftGrid audit.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="text-2xl font-bold">
                {auditsAwaitingReview.length}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Awaiting review
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <div className="text-2xl font-bold">
                {publishedAudits.length}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Published
              </div>
            </div>
          </div>

          <Link
            href="/admin/audits"
            className="mt-6 inline-flex rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white hover:bg-[#4338CA]"
          >
            Open Audit Queue →
          </Link>
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-950">
                Recent merchants
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Newest merchant records
              </p>
            </div>

            <Link
              href="/admin/merchants"
              className="text-xs font-bold text-[#4F46E5] hover:underline"
            >
              All merchants →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {!recentMerchants.length ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                No merchants yet.
              </div>
            ) : (
              recentMerchants.map((merchant) => (
                <div
                  key={merchant.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <div className="font-semibold text-slate-950">
                      {merchant.business_name}
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      {merchant.contact_email}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    {formatDate(merchant.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-950">
                Recent audits
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Latest store assessments
              </p>
            </div>

            <Link
              href="/admin/audits"
              className="text-xs font-bold text-[#4F46E5] hover:underline"
            >
              Audit queue →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {!recentAudits.length ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                No audits yet.
              </div>
            ) : (
              recentAudits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-950">
                      {audit.merchant_name}
                    </div>

                    <div className="mt-1 truncate text-xs text-slate-400">
                      {audit.store_url}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {audit.overall_score !== null && (
                      <span className="text-sm font-bold text-slate-950">
                        {audit.overall_score}/100
                      </span>
                    )}

                    <StatusBadge status={audit.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-950">
              Support queue
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Merchant requests and expert assistance
            </p>
          </div>

          <Link
            href="/admin/support"
            className="text-xs font-bold text-[#4F46E5] hover:underline"
          >
            Open support →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {!recentTickets.length ? (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              No support tickets yet.
            </div>
          ) : (
            recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-950">
                    {ticket.subject}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    {ticket.merchant?.business_name ??
                      "Unknown merchant"}{" "}
                    ·{" "}
                    {ticket.merchant?.contact_email ?? ""}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={ticket.status} />

                  <span className="text-xs text-slate-400">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-950">
          Quick actions
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Review Applications", "/admin/applications"],
            ["Review Audits", "/admin/audits"],
            ["Manage Opportunities", "/admin/opportunities"],
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
    </div>
  );
}
