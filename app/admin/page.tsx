import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Dashboard — GiftGrid",
};

type Merchant = {
  id: string;
  business_name: string;
  business_email: string;
  created_at: string;
};

type Application = {
  id: string;
  status: string;
  submitted_at: string;
  merchant: {
    business_name: string;
    business_email: string;
  } | null;
  store: {
    store_url: string;
    platform: string | null;
  } | null;
};

type MerchantApplicationRow = {
  id: string;
  status: string;
  submitted_at: string | null;
  business_name: string;
  business_email: string;
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
    business_email: string;
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
    indigo: "bg-indigo-50 text-[#0F766E]",
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
  const supabase = await createClient();

  const [
    merchantsRes,
    applicationsRes,
    
    opportunitiesRes,
    submissionsRes,
    threadsRes,
    ticketsRes,
    documentsRes,
  ] = await Promise.all([
    supabase
      .from("merchant_profiles")
      .select("id, business_name, business_email, created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("merchant_profiles")
      .select("id, status:application_status, submitted_at:application_submitted_at, business_name, business_email, store_url")
      .not("application_status", "eq", "draft")
      .order("application_submitted_at", { ascending: false, nullsFirst: false }),

    

    supabase
      .from("opportunities")
      .select(
        "id, company_name, category, active:is_active, public_display:is_public, created_at"
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
        "id, subject, status, created_at, merchant:merchant_profiles(business_name, business_email)"
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
    
    opportunitiesRes.error,
    submissionsRes.error,
    threadsRes.error,
    ticketsRes.error,
    documentsRes.error,
  ].filter(Boolean);

  const merchants = (merchantsRes.data ?? []) as Merchant[];
  const applications = ((applicationsRes.data ?? []) as unknown as MerchantApplicationRow[]).map((item) => ({
    id: item.id,
    status: item.status,
    submitted_at: item.submitted_at || new Date(0).toISOString(),
    merchant: { business_name: item.business_name, business_email: item.business_email },
    store: { store_url: item.store_url, platform: null },
  })) as Application[];
  const opportunities = (opportunitiesRes.data ?? []) as Opportunity[];
  const submissions = submissionsRes.data ?? [];
  const threads = threadsRes.data ?? [];
  const tickets = (ticketsRes.data ?? []) as unknown as SupportTicket[];
  const documents = documentsRes.data ?? [];

  
  

  

  

  



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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            GiftGrid Admin
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Real-time operational view of merchants, applications,
            opportunities and support.
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
                Live from merchant profiles
              </p>
            </div>

            <Link
              href="/admin/applications"
              className="text-xs font-bold text-[#0F766E] hover:underline"
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
                      {item.merchant?.business_email ?? ""}
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
              className="text-xs font-bold text-[#0F766E] hover:underline"
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
                      {merchant.business_email}
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
            className="text-xs font-bold text-[#0F766E] hover:underline"
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
                    {ticket.merchant?.business_email ?? ""}
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
            
            ["Manage Opportunities", "/admin/opportunities"],
            ["Handle Support", "/admin/support"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-slate-200 px-4 py-4 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#0F766E]"
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
