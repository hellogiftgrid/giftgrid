export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ggGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      {/* A grid of four rounded cells reads as both "grid" and an abstract G */}
      <rect x="4" y="4" width="14" height="14" rx="4" fill="url(#ggGrad)" />
      <rect x="22" y="4" width="14" height="14" rx="4" fill="url(#ggGrad)" opacity="0.35" />
      <rect x="4" y="22" width="14" height="14" rx="4" fill="url(#ggGrad)" opacity="0.35" />
      <rect x="22" y="22" width="14" height="14" rx="4" fill="url(#ggGrad)" />
    </svg>
  );
}
