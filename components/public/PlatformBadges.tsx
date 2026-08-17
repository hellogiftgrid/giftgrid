"use client";

import { useState } from "react";
import { supportedPlatforms } from "@/config/branding";

// Drop each platform's official logo at /public/images/platforms/<slug>.png.
// Until a file exists, that entry falls back to a clean text wordmark
// instead of a broken image — states a real capability (which store
// platforms GiftGrid can audit), not a claim of partnership.
function PlatformLogo({ name, slug }: { name: string; slug: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="text-[15px] font-semibold text-textPrimary">{name}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/platforms/${slug}.png`}
      alt={name}
      className="h-6 w-auto object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export default function PlatformBadges() {
  return (
    <div className="border-b border-borderCustom bg-secondary py-8">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-7">
        <span className="text-[13px] font-medium text-textSecondary">Reviews stores built on</span>
        {supportedPlatforms.map((platform) => (
          <PlatformLogo key={platform.slug} name={platform.name} slug={platform.slug} />
        ))}
      </div>
    </div>
  );
}
