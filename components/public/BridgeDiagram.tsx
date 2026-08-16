export default function BridgeDiagram() {
  return (
    <section className="border-b border-t border-borderCustom bg-secondarySoft">
      <div className="mx-auto max-w-[1180px] px-7 py-24">
        <div className="mx-auto mb-2 max-w-[560px] text-center">
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">The Bridge</span>
          <h2 className="mt-3.5 font-display text-[clamp(26px,3.4vw,38px)] font-semibold tracking-tight">
            You don&apos;t apply to a dozen platforms. You apply to one.
          </h2>
        </div>

        <div className="py-14">
          <svg viewBox="0 0 1000 260" className="h-auto w-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="110" cy="130" r="46" className="fill-secondary stroke-borderCustom" strokeWidth="1.4" />
            <text x="110" y="126" textAnchor="middle" className="fill-textPrimary text-[13.5px] font-semibold">Merchant</text>
            <text x="110" y="142" textAnchor="middle" className="fill-textSecondary text-[11px] uppercase tracking-wide">store</text>

            <path d="M156 130 H 404" className="stroke-accent animate-flowDash" strokeWidth="1.4" fill="none" strokeDasharray="6 6" opacity="0.75" />

            <circle cx="460" cy="130" r="54" className="fill-accent stroke-accent" strokeWidth="1.4" />
            <text x="460" y="126" textAnchor="middle" fill="#FFFFFF" className="text-[13.5px] font-semibold">GiftGrid</text>
            <text x="460" y="143" textAnchor="middle" fill="#FFFFFF" className="text-[11px] uppercase tracking-wide">review + match</text>

            <path d="M514 115 C 620 90, 700 68, 800 55" className="stroke-accent animate-flowDash" strokeWidth="1.4" fill="none" strokeDasharray="6 6" opacity="0.75" />
            <path d="M514 124 C 620 116, 700 100, 800 95" className="stroke-accent animate-flowDash" strokeWidth="1.4" fill="none" strokeDasharray="6 6" opacity="0.75" />
            <path d="M514 136 C 620 144, 700 160, 800 165" className="stroke-accent animate-flowDash" strokeWidth="1.4" fill="none" strokeDasharray="6 6" opacity="0.75" />
            <path d="M514 145 C 620 170, 700 192, 800 205" className="stroke-accent animate-flowDash" strokeWidth="1.4" fill="none" strokeDasharray="6 6" opacity="0.75" />

            <circle cx="850" cy="55" r="36" className="fill-secondary stroke-borderCustom" strokeWidth="1.4" />
            <text x="850" y="59" textAnchor="middle" className="fill-textPrimary text-[12px] font-semibold">Gifting</text>

            <circle cx="850" cy="95" r="36" className="fill-secondary stroke-borderCustom" strokeWidth="1.4" />
            <text x="850" y="99" textAnchor="middle" className="fill-textPrimary text-[12px] font-semibold">Wholesale</text>

            <circle cx="850" cy="165" r="36" className="fill-secondary stroke-borderCustom" strokeWidth="1.4" />
            <text x="850" y="169" textAnchor="middle" className="fill-textPrimary text-[11.5px] font-semibold">Distribution</text>

            <circle cx="850" cy="205" r="36" className="fill-secondary stroke-borderCustom" strokeWidth="1.4" />
            <text x="850" y="209" textAnchor="middle" className="fill-textPrimary text-[10px] font-semibold">Employee Rewards</text>
          </svg>
        </div>

        <p className="mx-auto max-w-[520px] text-center text-[14.5px] text-textSecondary">
          GiftGrid reviews your store, then routes qualified merchants into the right opportunities — tracked
          from submission to response.
        </p>
      </div>
    </section>
  );
}
