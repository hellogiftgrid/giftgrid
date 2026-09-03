import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function BookedCallPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createAdminClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      id,
      guest_name,
      guest_email,
      start_at,
      end_at,
      guest_timezone,
      status,
      cal_meeting_url,
      primary_admin_id
    `)
    .eq("booked_call_token", params.token)
    .single();

  if (!booking) notFound();

  const { data: admin } = await supabase
    .from("booking_admins")
    .select("display_name")
    .eq("id", booking.primary_admin_id)
    .single();

  const start = new Date(booking.start_at);
  const end = new Date(booking.end_at);

  const date = new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeZone: booking.guest_timezone,
  }).format(start);

  const startTime = new Intl.DateTimeFormat("en", {
    timeStyle: "short",
    timeZone: booking.guest_timezone,
  }).format(start);

  const endTime = new Intl.DateTimeFormat("en", {
    timeStyle: "short",
    timeZone: booking.guest_timezone,
  }).format(end);

  const active =
    booking.status !== "cancelled" &&
    end.getTime() > Date.now();

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="/images/logo-horizontal.png"
              alt="GiftGrid"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="mt-6 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
            Booking confirmed
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            {active ? "Your GiftGrid call is ready" : "Your GiftGrid call"}
          </h1>

          <p className="mt-3 text-slate-500">
            You are meeting with{" "}
            <strong className="text-slate-900">
              {admin?.display_name || "GiftGrid Team"}
            </strong>
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Date
              </div>
              <div className="mt-2 font-semibold text-slate-900">
                {date}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Time
              </div>
              <div className="mt-2 font-semibold text-slate-900">
                {startTime} – {endTime}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Timezone
              </div>
              <div className="mt-2 font-semibold text-slate-900">
                {booking.guest_timezone}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-8 text-center">
            {active && booking.cal_meeting_url ? (
              <>
                <a
                  href={booking.cal_meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#4F46E5] px-8 py-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4338CA]"
                >
                  Join GiftGrid Call →
                </a>

                <p className="mt-4 text-sm text-slate-500">
                  Your secure GiftGrid booking page is the place to start your
                  call. The meeting room opens securely when you join.
                </p>
              </>
            ) : (
              <div className="rounded-xl bg-slate-50 px-6 py-5 text-sm text-slate-500">
                This call is not currently available.
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            Confirmation sent to {booking.guest_email}
          </div>
        </div>
      </div>
    </main>
  );
}
