import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.degiftgrid.com";

function formatDateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export default async function AdminCallsPage() {
  const supabase = createClient();

  const [
    { data: bookingAdmins, error: adminsError },
    { data: bookings, error: bookingsError },
    { data: eventTypes, error: eventTypesError },
  ] = await Promise.all([
    supabase
      .from("booking_admins")
      .select(
        "id, profile_id, slug, display_name, booking_title, timezone, active, accepting_bookings"
      )
      .order("display_name"),

    supabase
      .from("bookings")
      .select(
        "id, guest_name, guest_email, guest_phone, start_at, end_at, status, primary_admin_id, secondary_admin_id, meeting_url, zoom_join_url, guest_timezone, guest_notes, created_at, event_type:booking_event_types(name, duration_minutes)"
      )
      .order("start_at", { ascending: true })
      .limit(100),

    supabase
      .from("booking_event_types")
      .select("id, name, slug, duration_minutes, active, public_bookable")
      .order("duration_minutes"),
  ]);

  const error =
    adminsError?.message ||
    bookingsError?.message ||
    eventTypesError?.message ||
    null;

  const now = Date.now();

  const upcoming = (bookings ?? []).filter(
    (booking) =>
      new Date(booking.start_at).getTime() >= now &&
      !["cancelled", "completed", "no_show"].includes(
        booking.status
      )
  );

  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
  }).format(new Date());

  const callsToday = upcoming.filter((booking) => {
    const dateKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
    }).format(new Date(booking.start_at));

    return dateKey === todayKey;
  });

  const adminMap = new Map(
    (bookingAdmins ?? []).map((admin) => [admin.id, admin])
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
          Communications
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Calls
        </h1>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          Manage GiftGrid consultation links, availability and scheduled calls.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Today
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-950">
            {callsToday.length}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            calls scheduled
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Upcoming
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-950">
            {upcoming.length}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            confirmed future calls
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Admins
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-950">
            {(bookingAdmins ?? []).filter(
              (admin) => admin.active && admin.accepting_bookings
            ).length}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            currently accepting bookings
          </div>
        </div>
      </div>

      {/* SHAREABLE LINKS */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Shareable admin links
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Each admin has a public link that can be shared without requiring
            the visitor to create a GiftGrid account.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {(bookingAdmins ?? []).map((admin) => {
            const link = `${SITE_URL}/book/${admin.slug}`;

            return (
              <div
                key={admin.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="font-bold text-slate-950">
                    {admin.display_name}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    {admin.timezone}
                  </div>

                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-all text-sm font-semibold text-[#4F46E5] hover:underline"
                  >
                    {link}
                  </a>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Open
                  </a>

                  <div
                    className={`rounded-xl px-4 py-2 text-xs font-bold ${
                      admin.accepting_bookings
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {admin.accepting_bookings
                      ? "Accepting"
                      : "Paused"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* EVENT TYPES */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Call durations
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(eventTypes ?? []).map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="text-2xl font-bold text-slate-950">
                {event.duration_minutes} min
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-700">
                {event.name}
              </div>

              <div className="mt-2 text-xs text-slate-400">
                {event.public_bookable ? "Public" : "Private"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UPCOMING CALLS */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-950">
            Upcoming calls
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Live bookings from Supabase.
          </p>
        </div>

        {!upcoming.length ? (
          <div className="p-10 text-center text-sm text-slate-400">
            No upcoming calls.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcoming.map((booking: any) => {
              const primary =
                adminMap.get(booking.primary_admin_id);

              const secondary =
                booking.secondary_admin_id
                  ? adminMap.get(booking.secondary_admin_id)
                  : null;

              const timezone =
                booking.guest_timezone ||
                primary?.timezone ||
                "UTC";

              return (
                <div
                  key={booking.id}
                  className="flex flex-col gap-4 px-6 py-5 xl:flex-row xl:items-center xl:justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-950">
                      {booking.guest_name}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      {booking.guest_email}
                    </div>

                    <div className="mt-2 text-xs font-semibold text-[#4F46E5]">
                      {booking.event_type?.name}
                    </div>

                    <div className="mt-2 text-xs text-slate-400">
                      With {primary?.display_name || "Admin"}
                      {secondary
                        ? ` + ${secondary.display_name}`
                        : ""}
                    </div>
                  </div>

                  <div className="text-sm text-slate-600">
                    {formatDateTime(
                      booking.start_at,
                      timezone
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold capitalize text-emerald-700">
                      {booking.status}
                    </span>

                    {(booking.zoom_join_url ||
                      booking.meeting_url) && (
                      <a
                        href={
                          booking.zoom_join_url ||
                          booking.meeting_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-bold text-white hover:bg-[#4338CA]"
                      >
                        Join call
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
