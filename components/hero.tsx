import Link from "next/link";
import { siteConfig } from "@/config/branding";

// Hero background configured with external direct streaming links
// Replace the placeholder URLs below with your actual uploaded Imgur/Supabase links.
const HERO_POSTER_URL = "https://xxkodcatazrbjhwddqxg.supabase.co/storage/v1/object/public/hero-assets/frame_004.jpg";
const HERO_VIDEO_URL = "https://xxkodcatazrbjhwddqxg.supabase.co/storage/v1/object/public/hero-assets/Black_gift_box_opening_202608171521.mp4";

export default function Hero() {
  return (
    <section className="relative flex min-h-[86vh] items-center overflow-hidden border-b border-borderCustom">
      <div className="absolute inset-0 bg-primary">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(212,175,55,.10), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(30,41,59,.9), transparent 60%)",
          }}
        />
      </div>

      {/* Video layer is now active and uses cloud link inputs */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={HERO_POSTER_URL}
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-primary/55" />

      <div className="hero-grid-bg absolute inset-0 animate-driftGrid" />
      <div
        className="absolute -right-36 -top-44 h-[620px] w-[620px] rounded-full blur-[10px]"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,.16), transparent 65%)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1180px] px-7 py-28">
        <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
          B2B Merchant Opportunity Platform
        </span>
        <h1 className="mt-5 max-w-[820px] font-display text-[clamp(38px,5.6vw,68px)] font-semibold leading-[1.06] tracking-tight">
          Position Your Brand for Corporate Gifting Opportunities.
        </h1>
        <p className="mt-5 max-w-[560px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-textSecondary">
          {siteConfig.description}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/merchant/application"
            className="rounded-[3px] bg-accent px-6 py-3 text-[14.5px] font-semibold text-primary transition-transform hover:-translate-y-0.5"
          >
            Apply as a Merchant
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-[3px] border border-borderCustom px-6 py-3 text-[14.5px] font-semibold hover:border-accent hover:text-accent"
          >
            See How It Works
          </Link>
        </div>

        <div className="mt-7 flex items-center gap-2.5 text-[13.5px] text-textSecondary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-accent">
            <rect x="4" y="11" width="16" height="9" rx="1.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Reviewed securely — your store data is never shared without authorization.
        </div>
      </div>
    </section>
  );
}
