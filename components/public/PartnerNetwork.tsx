"use client";

import { useState } from "react";
import { partnerNetwork } from "@/config/branding";

// Drop each partner's official logo at /public/images/partners/<slug>.png.
// Until a file exists, that entry falls back to a clean text wordmark
// instead of a broken image.
function PartnerLogo({ name, slug, chip }: { name: string; slug: string; chip?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="whitespace-nowrap text-[17px] font-semibold text-textSecondary">{name}</span>;
  }

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/partners/${slug}.png`}
      alt={name}
      className={
        chip === "dark"
          ? "h-6 w-auto object-contain"
          : "h-7 w-auto object-contain opacity-70 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0"
      }
      onError={() => setFailed(true)}
    />
  );


  if (chip === "dark") {
    return <div className="flex items-center rounded-lg bg-footerBg px-4 py-2.5">{img}</div>;
  }

  return img;
}

export default function PartnerNetwork() {
  const track = [...partnerNetwork, ...partnerNetwork];

  return (
    <div className="border-b border-borderCustom bg-secondarySoft py-9">
      <div className="mx-auto mb-5 max-w-[1180px] px-7 text-center">
        <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-accent">Where We Submit You</span>
        <h2 className="mt-1.5 text-[14.5px] font-semibold text-textSecondary">
          Connected to leading corporate gifting &amp; rewards platforms
        </h2>
      </div>
      <div className="marquee-mask overflow-hidden">
        <div className="flex w-max animate-scrollMarquee items-center gap-10">
          {track.map((partner, i) => (
            <PartnerLogo
              key={`${partner.slug}-${i}`}
              name={partner.name}
              slug={partner.slug}
              chip={"chip" in partner ? partner.chip : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
