import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import Hero from "@/components/public/Hero";
import PartnerNetwork from "@/components/public/PartnerNetwork";
import PlatformBadges from "@/components/public/PlatformBadges";
import Marquee from "@/components/public/Marquee";
import CategoryGrid from "@/components/public/CategoryGrid";
import BridgeDiagram from "@/components/public/BridgeDiagram";
import TrustSection from "@/components/public/TrustSection";
import { siteConfig } from "@/config/branding";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Position Your Brand for Corporate Gifting Opportunities`,
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PartnerNetwork />
        <PlatformBadges />
        <Marquee />
        <CategoryGrid />
        <BridgeDiagram />
        <TrustSection />

        <section className="border-t border-borderCustom py-28 text-center">
          <div className="mx-auto max-w-[680px] px-7">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">Get Started</span>
            <h2 className="mt-4 font-display text-[clamp(30px,4vw,46px)] font-semibold leading-tight tracking-tight">
              Ready to position your brand for the right opportunities?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/sign-up"
                className="rounded-full px-7 py-3.5 text-[14.5px] font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(90deg, #4F46E5, #F97316)" }}
              >
                Apply as a Merchant
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-borderCustom bg-secondary px-7 py-3.5 text-[14.5px] font-semibold text-textPrimary hover:border-accent hover:text-accent"
              >
                Talk to Our Team
              </Link>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
