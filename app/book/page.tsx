import CalendlyEmbed from "@/components/booking/CalendlyEmbed";

export const dynamic = "force-dynamic";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL || "";

export default function BookPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4F46E5]">
            GiftGrid
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Book a Call
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Speak with the GiftGrid team about your store, audit,
            recommendations, or commercial opportunities.
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

        <p className="mt-5 text-center text-xs text-slate-400">
          No GiftGrid account is required to book a call.
        </p>
      </div>
    </main>
  );
}
