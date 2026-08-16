import Link from "next/link";
import { siteConfig } from "@/config/branding";

// Hero background.
// Once the Veo-generated clip exists, drop it at /public/videos/hero.mp4
// and /public/images/hero-poster.jpg, then uncomment the <video> block below.
// A dark scrim keeps the headline legible over footage specifically in this
// section, independent of the site's light theme elsewhere.
export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-borderCustom">
      <div className="hero-blob-bg absolute inset-0" />
      <div className="absolute left-[8%] top-16 h-64 w-64 animate-blobDrift rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute right-[10%] top-32 h-56 w-56 animate-blobDrift rounded-full bg-accentAlt/10 blur-3xl" style={{ animationDelay: "2s" }} />

      {/*
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.jpg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40" />
      */}

      <div className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-14 px-7 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
        <div>
          <span className="inline-block rounded-full border border-borderCustom bg-secondary px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] text-accent">
            B2B Merchant Opportunity Platform
          </span>
          <h1 className="mt-6 max-w-[600px] font-display text-[clamp(36px,5vw,58px)] font-bold leading-[1.08] tracking-tight text-textPrimary">
            Position your brand for corporate gifting opportunities.
          </h1>
          <p className="mt-5 max-w-[480px] text-[clamp(15px,1.5vw,18px)] leading-relaxed text-textSecondary">
            {siteConfig.description}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/merchant/application"
              className="rounded-full px-7 py-3.5 text-[14.5px] font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(90deg, #4F46E5, #F97316)" }}
            >
              Apply as a Merchant
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-full border border-borderCustom bg-secondary px-7 py-3.5 text-[14.5px] font-semibold text-textPrimary hover:border-accent hover:text-accent"
            >
              See How It Works
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-2.5 text-[13.5px] text-textSecondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-accent">
              <rect x="4" y="11" width="16" height="9" rx="1.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Reviewed securely — your store data is never shared without authorization.
          </div>
        </div>

        {/* Illustrative category collage — abstract gradient tiles, not real product photography */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Corporate Gifting", from: "#4F46E5", to: "#818CF8" },
            { label: "Wholesale", from: "#F97316", to: "#FBBF24" },
            { label: "Bulk Buyers", from: "#0EA5E9", to: "#38BDF8" },
            { label: "Employee Rewards", from: "#EC4899", to: "#F472B6" },
          ].map((tile, i) => (
            <div
              key={tile.label}
              className={`flex aspect-square flex-col justify-end rounded-2xl p-5 text-white shadow-lg ${i === 1 ? "translate-y-6" : ""}`}
              style={{ background: `linear-gradient(135deg, ${tile.from}, ${tile.to})` }}
            >
              <span className="text-[13.5px] font-semibold">{tile.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
