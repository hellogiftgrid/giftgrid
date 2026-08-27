import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CalendlyEmbed from "@/components/booking/CalendlyEmbed";

export const dynamic = "force-dynamic";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL || "";

export default async function BookingPage({
  params,
}: {
  params: { adminSlug: string };
}) {
  const supabase = createClient();

  const { data: admin } = await supabase
    .from("booking_admins")
    .select(
      "id, slug, display_name, booking_title, active, accepting_bookings"
    )
    .eq("slug", params.adminSlug)
    .eq("active", true)
    .eq("accepting_bookings", true)
    .single();

  if (!admin) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            GiftGrid
          </div>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Book a call with {admin.display_name}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {admin.booking_title ||
              "Choose a convenient time to speak with the GiftGrid team."}
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {CALENDLY_URL ? (
            <CalendlyEmbed url={CALENDLY_URL} />
          ) : (
            <div className="p-12 text-center">
              <h2 className="text-xl font-bold text-slate-950">
                Booking is being configured
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Please check back shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
