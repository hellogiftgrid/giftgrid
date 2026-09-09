import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
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
        "id, email, full_name, role"
      )
      .eq("id", user.id)
      .single();

  if (profile?.role !== "super_admin") {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  const [{ error: bookingAdminBootstrapError }, { error: eventTypeBootstrapError }] =
    await Promise.all([
      admin.from("booking_admins").upsert(
        {
          profile_id: profile.id,
          slug: `giftgrid-${profile.id.replaceAll("-", "").slice(0, 12)}`,
          display_name: profile.full_name || "GiftGrid Team",
          booking_title: "Meet with GiftGrid",
          timezone: "UTC",
          active: true,
          accepting_bookings: true,
        },
        { onConflict: "profile_id" }
      ),
      admin.from("booking_event_types").upsert(
        {
          name: "GiftGrid introduction call",
          slug: "giftgrid-intro-call",
          description: "A 30-minute introduction to GiftGrid for brands and gifting teams.",
          duration_minutes: 30,
          buffer_before_minutes: 0,
          buffer_after_minutes: 10,
          minimum_notice_minutes: 60,
          booking_window_days: 60,
          active: true,
          public_bookable: true,
        },
        { onConflict: "slug" }
      ),
    ]);

  const [
    merchantCount,
    adminCount,
    bookingCount,
    activeBookingCount,
    activityCount,
  ] = await Promise.all([
    admin
      .from("merchant_profiles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    admin
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("role", [
        "admin",
        "super_admin",
      ]),

    admin
      .from("bookings")
      .select("id", {
        count: "exact",
        head: true,
      }),

    admin
      .from("bookings")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("status", [
        "confirmed",
        "scheduled",
      ])
      .gte(
        "start_at",
        new Date().toISOString()
      ),

    admin
      .from("activity_logs")
      .select("id", {
        count: "exact",
        head: true,
      }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      <section>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          Super Admin
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          GiftGrid Control Center
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Manage users, access, bookings and platform operations
          without leaving GiftGrid.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <Metric
          label="Merchants"
          value={merchantCount.count || 0}
        />

        <Metric
          label="Admins"
          value={adminCount.count || 0}
        />

        <Metric
          label="All bookings"
          value={bookingCount.count || 0}
        />

        <Metric
          label="Upcoming"
          value={activeBookingCount.count || 0}
        />

        <Metric
          label="Activity"
          value={activityCount.count || 0}
        />

      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ServiceStatus
          name="Supabase"
          detail={bookingAdminBootstrapError?.message || eventTypeBootstrapError?.message || merchantCount.error?.message || bookingCount.error?.message || "Database, call type, and super-admin booking profile connected"}
          ok={!bookingAdminBootstrapError && !eventTypeBootstrapError && !merchantCount.error && !bookingCount.error}
        />
        <ServiceStatus
          name="Cal booking"
          detail={process.env.CAL_WEBHOOK_SECRET ? "Secure webhook and branded call links configured" : "CAL_WEBHOOK_SECRET is missing"}
          ok={Boolean(process.env.CAL_WEBHOOK_SECRET)}
        />
        <ServiceStatus
          name="Transactional email"
          detail={process.env.BREVO_API_KEY || process.env.RESEND_API_KEY ? "Booking confirmations are enabled" : "Email credentials are incomplete"}
          ok={Boolean(process.env.BREVO_API_KEY || process.env.RESEND_API_KEY)}
        />
      </section>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

        <Action
          href="/dashboard/users"
          title="Users & Roles"
          text="Create users, confirm accounts and manage platform roles."
        />

        <Action
          href="/dashboard/activity"
          title="Activity Log"
          text="Review administrative and booking events."
        />

        <Action
          href="/dashboard/calls"
          title="Booking Operations"
          text="Monitor appointments and booking links."
        />

        <Action
          href="/dashboard/merchants"
          title="Merchant Operations"
          text="Review merchant accounts and applications."
        />

        <Action
          href="/dashboard/messages"
          title="Messages"
          text="Monitor merchant communications."
        />

        <Action
          href="/dashboard/support"
          title="Support"
          text="Manage support conversations and tickets."
        />

      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-7">
        <h2 className="text-lg font-bold text-slate-950">
          Infrastructure ownership
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          This workspace manages GiftGrid application operations.
          Supabase organization ownership, billing, project transfer
          and other provider-level controls remain controlled by the
          Supabase organization owner.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Current operator
        </h2>

        <div className="mt-4 rounded-2xl bg-slate-50 p-5">
          <div className="font-bold text-slate-950">
            {profile.full_name || "GiftGrid Super Admin"}
          </div>

          <div className="mt-1 text-sm text-slate-500">
            {profile.email}
          </div>

          <div className="mt-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            Super Admin
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>

      <div className="mt-3 text-3xl font-bold text-slate-950">
        {value}
      </div>
    </div>
  );
}

function Action({
  href,
  title,
  text,
}: {
  href: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <h2 className="text-lg font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

      <div className="mt-5 text-sm font-bold text-indigo-600">
        Open →
      </div>
    </Link>
  );
}

function ServiceStatus({ name, detail, ok }: { name: string; detail: string; ok: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-slate-950">{name}</h2>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {ok ? "Connected" : "Action needed"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}
