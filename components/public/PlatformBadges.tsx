import Image from "next/image";
import { supportedPlatforms } from "@/config/branding";

export default function PlatformBadges() {
  return (
    <section className="bg-slate-50 border-y border-slate-200 py-12">
      <div className="mx-auto max-w-[1180px] px-7">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.15em] text-slate-500 mb-8">
          Supported E-Commerce Platforms for Review
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {supportedPlatforms.map((platform) => (
            <div 
              key={platform.name} 
              className="group relative flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 h-10 w-32"
            >
              <Image
                src={`/images/platforms/${platform.slug}`}
                alt={`${platform.name} logo`}
                fill
                sizes="(max-width: 768px) 120px, 150px"
                className="object-contain"
                unoptimized // Prevents Next.js optimization errors for custom .jfif extension files
              />
              {/* Screen-reader backup text descriptor */}
              <span className="sr-only">{platform.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
