import PageSections from "@/components/public/PageSections";
import BookingForm from "@/components/booking/BookingForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Book a Call | GiftGrid",
  description:
    "Book a call with a member of the GiftGrid team.",
};

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const supabase = await createClient();
  const [{ data: admin }, { data: eventTypes }] = await Promise.all([
    supabase.from("booking_admins").select("id,slug,display_name,timezone").eq("active", true).eq("accepting_bookings", true).limit(1).maybeSingle(),
    supabase.from("booking_event_types").select("id,name,slug,description,duration_minutes").eq("active", true).eq("public_bookable", true).order("duration_minutes"),
  ]);
  return (
    <main className="site-themed min-h-screen bg-[#f4f6fa]">
      <PageSections path="/book" />
      <section className="overflow-hidden px-5 pb-20 pt-8 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex justify-center lg:justify-start">
              <img
                src="/images/logo-horizontal.png"
                alt="GiftGrid"
                className="h-10 w-auto object-contain"
              />
          </div>
          <div className="mt-12 grid items-start gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
            <div className="lg:sticky lg:top-12 lg:pt-12">
              <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-blue-700">A useful 30-minute conversation</span>
              <h2 className="mt-7 max-w-xl text-5xl font-semibold leading-[.98] tracking-[-.05em] text-slate-950 md:text-6xl">Let&apos;s make gifting feel simple.</h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">Tell us what you&apos;re planning. We&apos;ll help you find the right brands, sharpen your gifting program, or prepare your store for larger opportunities.</p>
              <div className="mt-10 space-y-5 border-t border-slate-200 pt-8">
                {[
                  ["Choose a time", "Availability automatically appears in your timezone."],
                  ["Meet the right person", "We route your conversation to the GiftGrid team member who can help."],
                  ["Receive a private call link", "Your confirmation email includes your secure GiftGrid join page."],
                ].map(([title, copy]) => (
                  <div key={title} className="flex gap-4">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-blue-600" />
                    <div><h2 className="font-semibold text-slate-950">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{copy}</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-9 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                {["No account required", "Secure booking", "Free intro call"].map((item) => <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2">{item}</span>)}
              </div>
            </div>
            <div className="rounded-[36px] border border-white bg-white/70 p-3 shadow-[0_30px_100px_-50px_rgba(15,23,42,.35)] sm:p-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-8">
                {admin && eventTypes?.length ? <BookingForm adminId={admin.id} adminSlug={admin.slug} adminTimezone={admin.timezone} eventTypes={eventTypes} /> : <div className="p-10 text-center text-sm text-slate-500">Scheduling is being prepared. Please check again shortly.</div>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
