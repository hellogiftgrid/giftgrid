import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "About GiftGrid",
  description: "Why GiftGrid exists, and how it helps e-commerce brands reach real commercial opportunities.",
};

const pillars = [
  {
    title: "Merchant-first review",
    body: "Before GiftGrid submits a store anywhere, it's actually reviewed — technically, structurally, and on product presentation. We don't forward stores that aren't ready.",
  },
  {
    title: "One application, many paths",
    body: "Instead of applying separately to every gifting platform, wholesaler, or corporate buyer, merchants go through one process. GiftGrid handles the routing.",
  },
  {
    title: "A trusted developer network",
    body: "When a store needs work before it's ready, GiftGrid can introduce merchants to individual developers we know and trust — not a faceless marketplace.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="border-b border-borderCustom py-28">
          <div className="mx-auto max-w-[760px] px-7">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">About GiftGrid</span>
            <h1 className="mt-5 font-display text-[clamp(32px,5vw,52px)] font-semibold leading-[1.1] tracking-tight">
              Built Around Better Opportunities for E-Commerce Brands.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-textSecondary">
              GiftGrid exists because most e-commerce brands never see the commercial opportunities available
              to them — corporate gifting, bulk buyers, wholesale, procurement, distribution — because applying
              to each one individually takes time, context, and relationships most small teams don't have.
              GiftGrid reviews a store, prepares it, and manages the path to the opportunities that actually fit.
            </p>
          </div>
        </section>

        <section className="border-b border-borderCustom py-24">
          <div className="mx-auto max-w-[1180px] px-7">
            <div className="mb-14 max-w-[600px]">
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">What We Believe</span>
              <h2 className="mt-3.5 font-display text-[clamp(26px,3vw,36px)] font-semibold tracking-tight">
                How we operate
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {pillars.map((p) => (
                <div key={p.title} className="rounded-md border border-borderCustom bg-secondary p-7">
                  <h3 className="mb-2.5 text-[16.5px] font-semibold">{p.title}</h3>
                  <p className="text-[14px] leading-relaxed text-textSecondary">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-[760px] px-7 text-center">
            <h2 className="font-display text-[clamp(24px,3vw,32px)] font-semibold tracking-tight">
              We're early, and we're building this in the open.
            </h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-relaxed text-textSecondary">
              We won't list clients, case studies, or team bios here until they're real. As GiftGrid grows,
              this page — and our track record — will grow with it, managed directly from Admin&nbsp;→&nbsp;Website Content.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
