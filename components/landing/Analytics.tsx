export default function Analytics() {
  return (
    <section className="border-b border-borderCustom bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="mx-auto mb-14 max-w-[680px] text-center">
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
            One Application
          </span>
          <h2 className="mt-4 font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.1] tracking-tight text-balance">
            You don&apos;t apply to a dozen platforms. You apply to one.
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-textSecondary">
            Track, analyze, and optimize how your store performs across every
            opportunity — all from a single dashboard.
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-[clamp(22px,2.6vw,32px)] font-semibold leading-[1.15] tracking-tight text-balance">
              Campaign Performance &amp; ROI Analytics
            </h3>
            <p className="mt-4 max-w-[440px] text-[16px] leading-relaxed text-textSecondary">
              See where your store was submitted, what came back, and which
              opportunities are driving real results.
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-6">
              {[
                { value: "1", label: "Application" },
                { value: "9", label: "Opportunity types" },
                { value: "100%", label: "Human reviewed" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-[28px] font-semibold text-accent">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-[13px] leading-snug text-textSecondary">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden rounded-2xl border border-borderCustom shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/roi-analytics-dashboard.png"
              alt="Campaign performance and ROI analytics dashboard"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
