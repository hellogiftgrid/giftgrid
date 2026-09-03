import CalBooking from "@/components/cal/CalBooking";
import Link from "next/link";

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
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              GiftGrid
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Book a Call
            </h1>

            <p className="mt-4 text-base leading-8 text-slate-600">
              Choose a convenient time to speak with a member of the
              GiftGrid team about your store, audit, recommendations,
              corporate gifting, or commercial opportunities.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
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

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <CalBooking />

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F46E5]">
              What happens next
            </p>

            <div className="mt-6 space-y-6">
              <div>
                <div className="font-bold text-slate-950">
                  1. Choose a time
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Select an available GiftGrid appointment.
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-950">
                  2. Meet your GiftGrid team member
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Your booking identifies the team member handling your call.
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-950">
                  3. Receive confirmation
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Your appointment details are sent to your email.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">
                Need help?
              </p>

              <a
                href="mailto:support@degiftgrid.com"
                className="mt-1 block text-sm text-[#4F46E5] hover:underline"
              >
                support@degiftgrid.com
              </a>
            </div>

            <Link
              href="/"
              className="mt-5 block text-center text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              Return to GiftGrid
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
