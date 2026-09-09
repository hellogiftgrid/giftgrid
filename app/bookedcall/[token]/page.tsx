import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your secure GiftGrid call",
  robots: { index: false, follow: false },
};

export default async function BookedCallPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
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
    .eq("booked_call_token", token)
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
    <main className="site-themed min-h-screen bg-[#f4f6fa] px-5 py-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
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

        <div className="mt-9 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_100px_-50px_rgba(15,23,42,.35)] lg:grid lg:grid-cols-[1fr_.72fr]">
          <div className="p-7 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
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

          <div className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-400">
            Confirmation sent to {booking.guest_email}
          </div>
          </div>
          <div className="flex flex-col justify-center bg-blue-600 p-7 text-center text-white sm:p-10">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/15 text-2xl">↗</span>
            <h2 className="mt-5 text-2xl font-semibold">Your private meeting room</h2>
            <p className="mt-3 text-sm leading-6 text-blue-100">Join directly inside GiftGrid. You may be asked to allow your camera and microphone.</p>
          <div className="mt-7">
            {active && booking.cal_meeting_url ? (
              <>
                <a
                  href={booking.cal_meeting_url.includes("meet.jit.si") ? "#giftgrid-room" : booking.cal_meeting_url}
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Enter your GiftGrid call →
                </a>

                <p className="mt-4 text-xs leading-5 text-blue-100">
                  This private GiftGrid URL is your call link. Keep it safe—the
                  meeting room opens securely from this page when you join.
                </p>
              </>
            ) : (
              <div className="rounded-2xl bg-white/10 px-6 py-5 text-sm text-blue-100">
                This call is not currently available.
              </div>
            )}
          </div>

          </div>
          </div>
      </div>
      {active && booking.cal_meeting_url?.includes("meet.jit.si") && (
        <div id="giftgrid-room" className="mx-auto mt-8 max-w-6xl scroll-mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-xl">
          <iframe src={booking.cal_meeting_url} title="GiftGrid video call" allow="camera; microphone; fullscreen; display-capture; autoplay" className="h-[72vh] min-h-[560px] w-full border-0" />
        </div>
      )}
    </main>
  );
}
