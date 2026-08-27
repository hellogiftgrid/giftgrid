import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PublicBookingForm from "@/components/admin/PublicBookingForm";

export const dynamic = "force-dynamic";

export default async function PublicAdminBookingPage({
  params,
}: {
  params: { adminSlug: string };
}) {
  const supabase = createClient();

  const { data: admin } = await supabase
    .from("booking_admins")
    .select(
      "id, slug, display_name, booking_title, bio, avatar_url, timezone, active, accepting_bookings"
    )
    .eq("slug", params.adminSlug)
    .eq("active", true)
    .eq("accepting_bookings", true)
    .single();

  if (!admin) {
    notFound();
  }

  const { data: eventTypes } = await supabase
    .from("booking_event_types")
    .select(
      "id, name, slug, description, duration_minutes"
    )
    .eq("active", true)
    .eq("public_bookable", true)
    .order("duration_minutes");

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img
                src={admin.avatar_url || "/images/logo-full.png"}
                alt={admin.display_name}
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
                GiftGrid
              </div>

              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                Book a call with {admin.display_name}
              </h1>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                {admin.bio ||
                  "Choose a convenient time. You do not need a GiftGrid account to book."}
              </p>
            </div>
          </div>

          <PublicBookingForm
            adminId={admin.id}
            adminSlug={admin.slug}
            adminTimezone={admin.timezone}
            eventTypes={eventTypes || []}
          />
        </div>
      </div>
    </main>
  );
}
