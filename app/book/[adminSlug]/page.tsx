import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingForm from "@/components/booking/BookingForm";

export const dynamic = "force-dynamic";

export default async function AdminBookPage({
  params,
}: {
  params: Promise<{ adminSlug: string }>;
}) {
  const { adminSlug } = await params;
  const supabase = await createClient();

  const { data: admin } = await supabase
    .from("booking_admins")
    .select(
      "id, slug, display_name, booking_title, timezone, active, accepting_bookings"
    )
    .eq("slug", adminSlug)
    .eq("active", true)
    .eq("accepting_bookings", true)
    .single();

  if (!admin) {
    notFound();
  }

  const { data: eventTypes } = await supabase.from("booking_event_types").select("id,name,slug,description,duration_minutes").eq("active", true).eq("public_bookable", true).order("duration_minutes");

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-4 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4F46E5]">
            GiftGrid
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Book a call with {admin.display_name}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            {admin.booking_title ||
              "Choose a convenient time to speak with the GiftGrid team."}
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-8"><BookingForm adminId={admin.id} adminSlug={admin.slug} adminTimezone={admin.timezone} eventTypes={eventTypes || []} /></div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          No GiftGrid account is required to book.
        </p>

      </div>
    </main>
  );
}
