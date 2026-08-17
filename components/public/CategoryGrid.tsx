import Link from "next/link";
import Image from "next/image";
import { opportunityCategories, opportunityCategoryDescriptions, opportunityImages } from "@/config/branding";
import VideoBackground from "@/components/shared/VideoBackground";

export default function CategoryGrid() {
  return (
    <section id="network" className="relative overflow-hidden py-24">
      <VideoBackground
        src="/videos/opportunity-network.mp4"
        poster="/images/opportunity-network-poster.jpg"
        overlayClassName="bg-primary/92"
      />

      <div className="relative mx-auto max-w-[1180px] px-7">
        <div className="mb-14 max-w-[560px]">
          <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-accent">Opportunity Network</span>
          <h2 className="mt-3.5 font-display text-[clamp(28px,3.4vw,40px)] font-bold tracking-tight text-textPrimary">
            Every opportunity, mapped to your store.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-textSecondary">
            GiftGrid manages relationships across nine categories of buyers — you don&apos;t need to know which
            one fits. We do the matching.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {opportunityCategories.map((category) => {
            const imageSrc = opportunityImages[category];

            return (
              <Link
                key={category}
                href="/contact"
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl p-6 text-white shadow-sm outline-none transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-white border border-borderCustom"
              >
                {/* Full-bleed background image replacing the color gradient */}
                {imageSrc && (
                  <div className="absolute inset-0 w-full h-full z-0 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={imageSrc}
                      alt={category}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                      priority
                    />
                    {/* Semi-transparent dark overlay so white text stays readable over any image */}
                    <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/50" />
                  </div>
                )}

                {/* Description panel sliding up on hover */}
                <span className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-black/60 p-6 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 z-20">
                  <span className="text-[12.5px] leading-snug text-white/90">
                    {opportunityCategoryDescriptions[category]}
                  </span>
                </span>

                {/* Card Title Header */}
                <span className="relative z-10 flex items-center justify-between text-[15px] font-semibold transition-transform duration-300 group-hover:-translate-y-1 w-full drop-shadow-md">
                  {category}
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
