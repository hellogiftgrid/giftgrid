import Link from "next/link";
import { communityUrl } from "@/config/community";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BuyerDashboard from "@/components/buyer/BuyerDashboard";
import OpenSourcingPanel from "@/components/public/OpenSourcingPanel";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select(
        "id, email, full_name, role, is_active"
      )
      .eq("id", user.id)
      .single();

  if (!profile || profile.is_active === false) {
    redirect("/auth/sign-in");
  }

  if (
    profile.role === "admin" ||
    profile.role === "super_admin"
  ) {
    return (
      <AdminOverview
        fullName={
          profile.full_name ||
          "GiftGrid Admin"
        }
        role={profile.role}
      />
    );
  }

  if (profile.role === "corporate_buyer") {
    return <><OpenSourcingPanel /><BuyerDashboard /></>;
  }

  return <><OpenSourcingPanel /><MerchantOverview userId={user.id} /></>;
}

async function AdminOverview({
  fullName,
  role,
}: {
  fullName: string;
  role: string;
}) {
  const supabase = await createClient();

  

  const [
    merchants,
    applications,
    
    
    messages,
    support,
    documents,
    
    recentActivity,
  ] = await Promise.all([
    supabase
      .from("merchant_profiles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("merchant_applications")
      .select("id", {
        count: "exact",
        head: true,
      }),

    

    

    supabase
      .from("message_threads")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("support_tickets")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("documents")
      .select("id", {
        count: "exact",
        head: true,
      }),

    

    supabase
      .from("activity_logs")
      .select(
        "id, action, entity_type, created_at, metadata"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(8),
  ]);

  const cards = [
    {
      label: "Merchants",
      value: merchants.count || 0,
      href: "/dashboard/merchants",
    },
    {
      label: "Applications",
      value: applications.count || 0,
      href: "/dashboard/applications",
    },
    
    
    {
      label: "Messages",
      value: messages.count || 0,
      href: "/dashboard/messages",
    },
    {
      label: "Support",
      value: support.count || 0,
      href: "/dashboard/support",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              {role === "super_admin"
                ? "Super Admin"
                : "Admin Workspace"}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, {fullName}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Manage GiftGrid operations from one live workspace.
              These metrics come directly from your Supabase data.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            

            

            {role === "super_admin" && (
              <Link
                href="/dashboard/system"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                System
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Live
            </div>

            <div className="mt-3 text-3xl font-bold text-slate-950">
              {card.value}
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-600">
              {card.label}
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">

        

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Recent activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest operational events.
                </p>
              </div>

              <Link
                href="/dashboard/activity"
                className="text-sm font-bold text-indigo-600"
              >
                View log
              </Link>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {(recentActivity.data || []).map(
              (activity) => (
                <div
                  key={activity.id}
                  className="px-6 py-4"
                >
                  <div className="font-semibold text-slate-900">
                    {activity.action}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    {activity.entity_type ||
                      "system"}{" "}
                    ·{" "}
                    {new Intl.DateTimeFormat(
                      "en",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    ).format(
                      new Date(
                        activity.created_at
                      )
                    )}
                  </div>
                </div>
              )
            )}

            {!recentActivity.data?.length && (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                No activity recorded yet.
              </div>
            )}
          </div>
        </div>

      </section>

      {role === "super_admin" && (
        <section className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Super Admin controls
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Run platform operations without leaving GiftGrid
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Manage roles, review the activity log and
                operate the admin workspace.
              </p>
            </div>

            <Link
              href="/dashboard/users"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-black"
            >
              Manage Users
            </Link>
          </div>
        </section>
      )}

      

    </div>
  );
}

async function MerchantOverview({
  userId,
}: {
  userId: string;
}) {
  const supabase = await createClient();

  const [
    merchantRes,
    
    submissionsRes,
    documentsRes,
  ] = await Promise.all([
    supabase
      .from("merchant_profiles")
      .select(
        "id, business_name, application_status, store_url"
      )
      .eq("user_id", userId)
      .single(),

    

    supabase
      .from("opportunity_submissions")
      .select("id, status", {
        count: "exact",
      }),

    supabase
      .from("documents")
      .select("id, title, created_at")
      .order("created_at", {
        ascending: false,
      })
      .limit(5),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          Merchant Workspace
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Welcome back
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Manage your merchant profile, listings, documents and buyer connections
          from one place.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          

        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Your public profile</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">Your profile is public. Keep your business details current so buyers can understand what you offer.</p>
        <div className="mt-4 flex flex-wrap gap-3"><Link href={communityUrl(`/merchant/${userId}`)} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">View public merchant profile</Link><Link href="/dashboard/profile" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold">Edit profile</Link><Link href={communityUrl()} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold">Open community</Link></div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Metric
          label="Documents"
          value={documentsRes.data?.length || 0}
        />
        <Metric label="Buyer connections" value={0} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Business
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {merchantRes.data?.business_name ||
              "Your business"}
          </p>

          <div className="mt-5 space-y-3 text-sm">
            <div>
              <span className="text-slate-400">
                Store
              </span>

              <div className="font-semibold text-slate-800">
                {merchantRes.data?.store_url ||
                  "Not connected"}
              </div>
            </div>

            <div>
              <span className="text-slate-400">
                Application status
              </span>

              <div className="font-semibold capitalize text-slate-800">
                {merchantRes.data?.application_status ||
                  "Not started"}
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>

      <div className="mt-3 text-3xl font-bold text-slate-950">
        {value}
      </div>
    </div>
  );
}
