"use client";

import { useState } from "react";


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
