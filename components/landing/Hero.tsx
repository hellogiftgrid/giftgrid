import Link from "next/link";

const partners = [
  { name: "Gifted.co", src: "/images/partners/gifted.png" },
  { name: "Guusto", src: "/images/partners/guusto.png" },
  { name: "Goody", src: "/images/partners/goody.png" },
  { name: "Stadium", src: "/images/partners/stadium.png" },
  { name: "Snappy", src: "/images/partners/snappy.png" },
  { name: "Sendoso", src: "/images/partners/sendoso.png" },
];

export default function Hero() {
  return (
    <section className="hero-blob-bg relative overflow-hidden border-b border-borderCustom">
      <div className="mx-auto max-w-[1180px] px-7 pb-16 pt-16 lg:pb-24 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div>
            <span className="inline-flex items-center rounded-full border border-borderCustom bg-primary/70 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
              B2B Merchant Opportunity Platform
            </span>

            <h1 className="mt-6 font-display text-[clamp(34px,5.2vw,56px)] font-semibold leading-[1.05] tracking-tight text-balance">
              Position Your Brand for Corporate Gifting Opportunities.
            </h1>

            <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-textSecondary text-pretty">
              GiftGrid helps e-commerce brands prepare, review, and position their
              stores for opportunities within the corporate gifting ecosystem.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/book"
                className="inline-flex items-center rounded-full bg-accent px-6 py-3.5 text-[15px] font-semibold text-primary shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Book a Call with Our Team
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center rounded-full border border-borderCustom px-6 py-3.5 text-[15px] font-semibold text-textPrimary transition-colors hover:border-accent hover:text-accent"
              >
                How It Works
              </Link>
            </div>

            {/* Strategist card */}
            <Link
              href="/book"
              className="mt-9 flex max-w-[460px] items-center gap-4 rounded-2xl border border-borderCustom bg-primary p-3.5 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <div className="flex -space-x-2">
                {["SG", "MK", "AR"].map((initials, i) => (
                  <span
                    key={initials}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary text-[11px] font-semibold text-primary"
                    style={{
                      background: i === 0 ? "#4F46E5" : i === 1 ? "#F97316" : "#2563EB",
                    }}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-textPrimary">
                  Talk to Sarah: Your Gifting Strategist
                </p>
                <p className="truncate text-[12.5px] text-textSecondary">
                  Free 20-minute intro call
                </p>
              </div>
              <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-[12px] font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Booking Active
              </span>
            </Link>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-borderCustom bg-primary shadow-xl">
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster="/images/hero-poster.jpg"
              >
                <source src="/videos/hero.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* Network logos */}
        <div className="mt-14 lg:mt-20">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-textSecondary">
            Connected to leading corporate gifting networks
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-80 grayscale">
            {partners.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.name}
                src={p.src}
                alt={p.name}
                className="h-7 w-auto object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
