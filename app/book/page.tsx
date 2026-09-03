import CalBooking from "@/components/cal/CalBooking";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a Call | GiftGrid",
  description:
    "Book a call with a member of the GiftGrid team.",
};

export default function BookPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <img
                src="/images/logo-horizontal.png"
                alt="GiftGrid"
                className="h-10 w-auto object-contain"
              />
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
              Let&apos;s talk about your business.
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
              Speak directly with a member of the GiftGrid team about your
              store, audit, recommendations, corporate gifting, wholesale or
              commercial opportunities.
            </p>

            <div className="mt-8">
              <CalBooking />
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-semibold text-slate-500">
              <span className="rounded-full bg-slate-100 px-4 py-2">
                No account required
              </span>

              <span className="rounded-full bg-slate-100 px-4 py-2">
                Your local timezone
              </span>

              <span className="rounded-full bg-slate-100 px-4 py-2">
                Secure booking
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-sm font-bold text-[#4F46E5]">
              01
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-950">
              Choose a time
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Select an available GiftGrid appointment from the scheduler.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-sm font-bold text-[#4F46E5]">
              02
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-950">
              Meet your team member
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              GiftGrid assigns the available team member handling your call.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-sm font-bold text-[#4F46E5]">
              03
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-950">
              Join your call
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Your booking confirmation contains the meeting details.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
