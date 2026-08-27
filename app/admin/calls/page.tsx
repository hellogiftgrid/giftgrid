import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import AdminCallControl from "@/components/admin/AdminCallControl";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.degiftgrid.com";

function formatDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone || "UTC",
  }).format(new Date(value));
}

export default async function AdminCallsPage() {
  const admin = await requireAdmin();
  const supabase = createClient();

  const [{ data: bookingAdmin }, { data: bookings }, { data: eventTypes }] =
    await Promise.all([
      supabase
        .from("booking_admins")
        .select(
          "id, profile_id, slug, display_name, booking_title, timezone, active, accepting_bookings, google_calendar_email"
        )
        .eq("profile_id", admin.userId)
        .single(),

      supabase
        .from("bookings")
        .select(
          "id, guest_name, guest_email, start_at, end_at, status, meeting_url, zoom_join_url, primary_admin_id, secondary_admin_id, event_type:booking_event_types(name, duration_minutes)"
        )
        .or(
          `primary_admin_id.eq.${admin.userId},secondary_admin_id.eq.${admin.userId}`
        )
        .order("start_at", { ascending: true })
        .limit(100),

      supabase
        .from("booking_event_types")
        .select(
          "id, name, duration_minutes, active, public_bookable"
        )
        .eq("active", true)
        .order("duration_minutes"),
    ]);

  const now = Date.now();

  const upcoming = (bookings || []).filter(
    (booking) =>
      new Date(booking.start_at).getTime() >= now &&
      !["cancelled", "completed", "no_show"].includes(
        booking.status
      )
  );

  const connectedGoogle =
    !!bookingAdmin?.google_calendar_email;

  const siteLink = bookingAdmin
    ? `${SITE_URL}/book/${bookingAdmin.slug}`
    : null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          GiftGrid
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Your calls
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          Manage your booking page, availability and upcoming
          merchant conversations from one place.
        </p>
      </div>

      {bookingAdmin && (
        <div className="space-y-6">
          <AdminCallControl slug={bookingAdmin.slug} />

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Upcoming
              </div>

              <div className="mt-3 text-3xl font-bold text-slate-950">
                {upcoming.length}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                scheduled calls
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Calendar
              </div>

              <div className="mt-3 text-2xl font-bold text-slate-950">
                {connectedGoogle ? "Connected" : "Not connected"}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {bookingAdmin.google_calendar_email ||
                  "Connect Google Calendar to sync availability."}
              </p>

              {!connectedGoogle && (
                <a
                  href="/api/calendar/google/connect"
                  className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white"
                >
                  Connect Google Calendar
                </a>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Booking status
              </div>

              <div className="mt-3 text-2xl font-bold text-slate-950">
                {bookingAdmin.accepting_bookings
                  ? "Open"
                  : "Paused"}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {bookingAdmin.accepting_bookings
                  ? "Visitors can book with you."
                  : "New bookings are paused."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Call types
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Short calls and consultations available to visitors.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                {eventTypes?.length || 0} active
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(eventTypes || []).map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="text-2xl font-bold text-slate-950">
                    {event.duration_minutes} min
                  </div>

                  <div className="mt-1 text-sm font-semibold text-slate-700">
                    {event.name}
                  </div>

                  <div className="mt-3 text-xs text-emerald-600">
                    Public booking enabled
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-950">
                Upcoming calls
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Only real bookings from your GiftGrid database are shown.
              </p>
            </div>

            {!upcoming.length ? (
              <div className="px-6 py-14 text-center">
                <div className="text-lg font-semibold text-slate-700">
                  Your calendar is clear
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Share your booking link to start receiving calls.
                </p>

                {siteLink && (
                  <a
                    href={siteLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
                  >
                    View booking page
                  </a>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcoming.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-950">
                        {booking.guest_name}
                      </div>

                      <div className="mt-1 text-sm text-slate-500">
                        {booking.guest_email}
                      </div>

                      <div className="mt-2 text-xs font-semibold text-indigo-600">
                        {booking.event_type?.name ||
                          "GiftGrid Call"}
                      </div>
                    </div>

                    <div className="text-sm font-medium text-slate-600">
                      {formatDate(
                        booking.start_at,
                        bookingAdmin.timezone
                      )}
                    </div>

                    <div className="flex gap-2">
                      {(
                        booking.zoom_join_url ||
                        booking.meeting_url
                      ) && (
                        <a
                          href={
                            booking.zoom_join_url ||
                            booking.meeting_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white"
                        >
                          Join call
                        </a>
                      )}

                      <span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold capitalize text-emerald-700">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
