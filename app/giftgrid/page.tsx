import Link from "next/link";

export const metadata = {
  title: "GiftGrid | About the E-commerce Merchant Platform",
  description:
    "GiftGrid is an e-commerce merchant platform helping brands audit their stores, improve buyer readiness, and prepare for corporate gifting and commercial opportunities.",
  alternates: {
    canonical: "https://www.degiftgrid.com/giftgrid",
  },
};

export default function GiftGridPage() {
  return (
    <main className="bg-[#F7F9FC]">
      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4F46E5]">
          GiftGrid
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
          GiftGrid — E-commerce Merchant Platform
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          GiftGrid helps e-commerce merchants audit their online stores,
          improve buyer readiness, and prepare for corporate gifting,
          wholesale, and commercial opportunities.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {[
            "Store audits and readiness reviews",
            "Actionable store recommendations",
            "Corporate gifting preparation",
            "Wholesale and commercial readiness",
            "Buyer opportunity matching",
            "Merchant support and expert guidance",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="font-bold text-slate-950">
                {item}
              </h2>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/about"
            className="rounded-xl bg-[#4F46E5] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#4338CA]"
          >
            About GiftGrid
          </Link>

          <Link
            href="/blog"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            GiftGrid Blog
          </Link>
        </div>
      </section>
    </main>
  );
}
