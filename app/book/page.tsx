import CalendlyEmbed from "@/components/booking/CalendlyEmbed";

export const dynamic = "force-dynamic";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL || "";

export default function BookPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            GiftGrid
          </div>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Book a Call
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Choose a convenient time to speak with GiftGrid.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {CALENDLY_URL ? (
            <CalendlyEmbed url={CALENDLY_URL} />
          ) : (
            <div className="p-12 text-center text-sm text-slate-500">
              Booking is currently being configured.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
