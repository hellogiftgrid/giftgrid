import Link from "next/link";

export default function TeamGifting() {
  return (
    <section className="border-b border-borderCustom py-20 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 overflow-hidden rounded-2xl border border-borderCustom bg-secondary shadow-lg lg:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/team-gifting-dashboard.png"
              alt="GiftGrid team gifting dashboard showing gift lists and approvals"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="order-1 lg:order-2">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
              Team Gifting &amp; Collaboration
            </span>
            <h2 className="mt-4 font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.1] tracking-tight text-balance">
              Coordinate Gifting Across Your Entire Organization
            </h2>
            <p className="mt-5 max-w-[480px] text-[16px] leading-relaxed text-textSecondary">
              Build shared gift lists, route approvals to the right people, and keep
              every team aligned on corporate gifting programs — all in one place.
            </p>

            <ul className="mt-7 space-y-3">
              {[
                "Shared, permissioned gift lists for every team",
                "Built-in approval routing and status tracking",
                "One dashboard for the whole organization",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-textSecondary">
                  <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/how-it-works"
              className="mt-8 inline-flex items-center rounded-full border border-borderCustom px-6 py-3 text-[14.5px] font-semibold text-textPrimary transition-colors hover:border-accent hover:text-accent"
            >
              See how it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
