"use client";

import { useState } from "react";

/**
 * Drop-in looping video background for a section.
 *
 * Usage: point `src` / `poster` at files that don't exist yet in /public,
 * and this renders nothing extra until they do — no broken video icon, no
 * layout shift. Once you add the real files at those paths, the video
 * fades in automatically. No code changes needed on either end.
 */
export default function VideoBackground({
  src,
  poster,
  overlayClassName = "bg-black/45",
}: {
  src: string;
  poster?: string;
  /** Tailwind classes for the scrim drawn over the video, e.g. "bg-black/40". */
  overlayClassName?: string;
}) {
  const [available, setAvailable] = useState(true);

  if (!available) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        onError={() => setAvailable(false)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
}
