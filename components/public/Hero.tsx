import Link from "next/link";
import { siteConfig } from "@/config/branding";

export default function Hero() {
  return (
    <section className="relative flex min-h-[86vh] items-center overflow-hidden border-b border-slate-200 bg-white">
      {/* Background video layer - Opacity set to 100% for full clarity */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-100"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.jpg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* 
        This is the secret sauce: A smart white gradient overlay. 
        It fades to transparent on the right so your video stays 100% visible, 
        but adds a clean white fade behind the text so it stays perfectly legible!
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/10 md:to-transparent" />
      <div className="hero-grid-bg absolute inset-0 animate-driftGrid opacity-5" />

      <div className="relative z-10 mx-auto w-full max-w-[1180px] px-7 py-28">
        <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-indigo-700 font-bold drop-shadow-sm">
          B2B Merchant Opportunity Platform
        </span>
        
        {/* Text styling with a small shadow filter to pop over the video background element */}
        <h1 className="mt-5 max-w-[820px] font-display text-[clamp(38px,5.6vw,68px)] font-bold leading-[1.06] tracking-tight text-slate-900 drop-shadow-sm">
          Position Your Brand for Corporate Gifting Opportunities.
        </h1>
        <p className="mt-5 max-w-[560px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-slate-700 font-semibold drop-shadow-sm">
          {siteConfig.description}
        </p>

        {/* Action buttons */}
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/merchant/application"
            className="rounded-[6px] bg-slate-900 text-white hover:bg-black px-6 py-3.5 text-[14.5px] font-bold shadow-md transition-all hover:-translate-y-0.5"
          >
            Apply as a Merchant
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-[6px] border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-50 px-6 py-3.5 text-[14.5px] font-bold shadow-sm transition-all hover:-translate-y-0.5"
          >
            See How It Works
          </Link>
        </div>

        <div className="mt-7 flex items-center gap-2.5 text-[13.5px] text-slate-600 font-bold drop-shadow-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 text-indigo-600">
            <rect x="4" y="11" width="16" height="9" rx="1.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Reviewed securely — your store data is never shared without authorization.
        </div>
      </div>
    </section>
  );
}
