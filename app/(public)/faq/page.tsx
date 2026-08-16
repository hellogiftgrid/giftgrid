"use client";

import { useState } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

const faqs = [
  {
    q: "What is GiftGrid?",
    a: "GiftGrid is a platform that helps e-commerce brands prepare their stores, get a genuine readiness review, and get connected to relevant commercial opportunities — corporate gifting, wholesale, bulk buyers, procurement, distribution, and more — without applying to each one individually.",
  },
  {
    q: "Who can apply?",
    a: "Any e-commerce brand with a live, publicly accessible store — Shopify or otherwise. There's no size requirement, but your store needs to be functional enough for us to review.",
  },
  {
    q: "What exactly does the store review check?",
    a: "Six areas: technical health, mobile/UX, SEO, accessibility, navigation, and product presentation. Every check is either automated and human-verified, or flagged for manual review — see the Store Review page for the full breakdown.",
  },
  {
    q: "Do I need a perfect store to qualify?",
    a: "No. Most stores have things to improve. GiftGrid's job is to tell you what those things are and, where useful, connect you with a trusted developer to fix them — not to reject stores for imperfections.",
  },
  {
    q: "Do I submit to opportunity platforms myself?",
    a: "No. Once your store is ready, GiftGrid's team identifies the relevant opportunities and manages the submission on your behalf, tracking status and responses in your merchant portal.",
  },
  {
    q: "Is my store data shared with anyone?",
    a: "Only where necessary and authorized — for example, submitting your store to an opportunity you've qualified for. GiftGrid doesn't share merchant data with unrelated third parties.",
  },
  {
    q: "How long does the review take?",
    a: "It depends on our current review queue and how much manual verification your store needs. We'd rather give you an accurate answer when you apply than a number here that isn't reliable.",
  },
  {
    q: "What if I need development help before I qualify?",
    a: "If the review turns up something worth fixing, we can introduce you to a trusted individual developer with a realistic expected timeframe for the specific work involved.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <Header />
      <main>
        <section className="border-b border-borderCustom py-24">
          <div className="mx-auto max-w-[760px] px-7">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">FAQ</span>
            <h1 className="mt-5 font-display text-[clamp(32px,5vw,52px)] font-semibold leading-[1.1] tracking-tight">
              Common questions.
            </h1>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-[760px] px-7">
            {faqs.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={item.q} className="border-b border-borderCustom">
                  <button
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-[16px] font-semibold">{item.q}</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`flex-shrink-0 text-accent transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                  {isOpen && (
                    <p className="max-w-[620px] pb-6 text-[14.5px] leading-relaxed text-textSecondary">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
