import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Store Review — GiftGrid",
  description: "What GiftGrid actually checks before recommending your store for an opportunity.",
};

const categories = [
  {
    name: "Technical",
    checks: ["HTTPS", "Page availability", "Response status", "Page title & meta description", "Canonical & viewport", "HTML structure"],
  },
  {
    name: "Mobile & UX",
    checks: ["Viewport configuration", "Responsive signals", "Horizontal overflow", "Mobile layout signals"],
  },
  {
    name: "SEO",
    checks: ["Title & description", "Headings structure", "Image alt text", "Canonical tags", "Indexability signals"],
  },
  {
    name: "Accessibility",
    checks: ["Alt text coverage", "Form labels", "Heading order", "Basic contrast signals", "Structural accessibility"],
  },
  {
    name: "Navigation",
    checks: ["Internal links", "Broken links (where safely testable)", "Page availability"],
  },
  {
    name: "Product",
    checks: ["Title & imagery", "Description quality", "Pricing clarity", "CTA presence", "Review/trust signals"],
  },
];

const statuses = [
  { label: "Passed", desc: "The check met the expected standard." },
  { label: "Needs Attention", desc: "Works, but below the bar we'd recommend to buyers." },
  { label: "Failed", desc: "Does not meet the standard and should be fixed." },
  { label: "Not Tested", desc: "Couldn't be checked automatically." },
  { label: "Manual Review", desc: "Requires a human judgment call from our team." },
];

export default function StoreReviewPage() {
  return (
    <>
<main>
        <section className="border-b border-borderCustom py-24">
          <div className="mx-auto max-w-[760px] px-7">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">Store Review</span>
            <h1 className="mt-5 font-display text-[clamp(32px,5vw,52px)] font-semibold leading-[1.1] tracking-tight">
              A real audit, not a guess.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-textSecondary">
              GiftGrid inspects what's publicly available about your store across six categories. No fake speed
              numbers, no fake conversion scores, no fake checkout failures — we only measure what we can
              actually measure, and a human reviews it before you see it.
            </p>
          </div>
        </section>

        <section className="border-b border-borderCustom py-24">
          <div className="mx-auto max-w-[1180px] px-7">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <div key={cat.name} className="rounded-md border border-borderCustom bg-secondary p-7">
                  <h3 className="mb-4 text-[17px] font-semibold">{cat.name}</h3>
                  <ul className="space-y-2">
                    {cat.checks.map((check) => (
                      <li key={check} className="flex items-start gap-2.5 text-[13.5px] text-textSecondary">
                        <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                        {check}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-[820px] px-7">
            <div className="mb-12 max-w-[560px]">
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">Every Finding</span>
              <h2 className="mt-3.5 font-display text-[clamp(26px,3vw,36px)] font-semibold tracking-tight">
                Every result explains itself
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-textSecondary">
                Each finding shows what was checked, the result, why it matters, our recommendation, the
                evidence behind it, and whether it was automated or manually reviewed. Severity is scored
                Low, Medium, High, or Critical.
              </p>
            </div>

            <div className="overflow-hidden rounded-md border border-borderCustom">
              {statuses.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-center sm:gap-6 ${
                    i !== statuses.length - 1 ? "border-b border-borderCustom" : ""
                  }`}
                >
                  <span className="w-[160px] flex-shrink-0 font-mono text-[13px] text-accent">{s.label}</span>
                  <span className="text-[14px] text-textSecondary">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-borderCustom py-24 text-center">
          <div className="mx-auto max-w-[600px] px-7">
            <h2 className="font-display text-[clamp(26px,3.4vw,38px)] font-semibold tracking-tight">
              See what your store's review would look like.
            </h2>
            <Link
              href="/auth/sign-up"
              className="mt-8 inline-flex rounded-[3px] bg-accent px-6 py-3 text-[14.5px] font-semibold text-primary transition-transform hover:-translate-y-0.5"
            >
              Apply as a Merchant
            </Link>
          </div>
        </section>
      </main>
</>
  );
}
