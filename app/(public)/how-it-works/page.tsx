import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "How It Works — GiftGrid",
  description: "The path from application to opportunity, step by step.",
};

const steps = [
  {
    num: "01",
    title: "Apply",
    body: "Create an account and submit your store and business details through the merchant application.",
  },
  {
    num: "02",
    title: "Store Review",
    body: "GiftGrid runs a real audit — technical health, mobile/UX, SEO, accessibility, navigation, and product presentation. No fabricated scores.",
  },
  {
    num: "03",
    title: "Human Review",
    body: "Every automated finding is checked by our team before anything reaches you. Findings are labelled Passed, Needs Attention, Failed, or Manual Review.",
  },
  {
    num: "04",
    title: "Recommendations",
    body: "You receive a report with clear findings, priority actions, and — where it would genuinely help — an introduction to a trusted developer.",
  },
  {
    num: "05",
    title: "Developer Help (optional)",
    body: "If your store needs work first, GiftGrid can introduce you to an individual developer we trust, with a realistic timeframe.",
  },
  {
    num: "06",
    title: "Re-Review",
    body: "Once changes are made, GiftGrid re-checks the relevant areas so you're not guessing whether the fix landed.",
  },
  {
    num: "07",
    title: "Opportunity Matching",
    body: "GiftGrid identifies which opportunities in the network — gifting, wholesale, bulk, corporate, procurement, distribution — genuinely fit your store.",
  },
  {
    num: "08",
    title: "Submission & Tracking",
    body: "GiftGrid's team submits your store to the relevant opportunity and tracks where it went, when, and what came back — visible in your portal.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
<main>
        <section className="border-b border-borderCustom py-24">
          <div className="mx-auto max-w-[760px] px-7">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">The Process</span>
            <h1 className="mt-5 font-display text-[clamp(32px,5vw,52px)] font-semibold leading-[1.1] tracking-tight">
              From application to opportunity.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-textSecondary">
              You don't apply to a dozen platforms individually. You apply to GiftGrid once — we review,
              prepare, and manage the rest.
            </p>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-[820px] px-7">
            <ol>
              {steps.map((step, i) => (
                <li key={step.num} className="relative flex gap-8 pb-14 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-[13px] text-accent">{step.num}</span>
                    {i < steps.length - 1 && <span className="mt-3 w-px flex-1 bg-borderCustom" />}
                  </div>
                  <div className="pb-2">
                    <h3 className="mb-2 text-[18.5px] font-semibold">{step.title}</h3>
                    <p className="max-w-[560px] text-[14.5px] leading-relaxed text-textSecondary">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-borderCustom py-24 text-center">
          <div className="mx-auto max-w-[600px] px-7">
            <h2 className="font-display text-[clamp(26px,3.4vw,38px)] font-semibold tracking-tight">
              Ready to see where your store stands?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/sign-up"
                className="rounded-[3px] bg-accent px-6 py-3 text-[14.5px] font-semibold text-primary transition-transform hover:-translate-y-0.5"
              >
                Apply as a Merchant
              </Link>
              <Link
                href="/store-review"
                className="rounded-[3px] border border-borderCustom px-6 py-3 text-[14.5px] font-semibold hover:border-accent hover:text-accent"
              >
                See What We Review
              </Link>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
