import Link from "next/link";
import { opportunityCategories, opportunityImages } from "@/config/branding";

export default function OpportunityNetwork() {
  return (
    <section className="border-b border-borderCustom py-20 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="mx-auto max-w-[640px] text-center">
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
            The Network
          </span>
          <h2 className="mt-4 font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.1] tracking-tight text-balance">
            Opportunity Network
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-textSecondary">
            One application connects your store to a network of corporate gifting,
            wholesale, retail, and procurement opportunities.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
          {opportunityCategories.map((category) => (
            <Link
              key={category}
              href="/how-it-works"
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-borderCustom shadow-sm transition-transform hover:-translate-y-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={opportunityImages[category]}
                alt={category}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-textPrimary/85 via-textPrimary/20 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-4 text-[13.5px] font-semibold text-primary sm:text-[15px]">
                {category}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
