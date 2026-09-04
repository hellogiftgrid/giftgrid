const pillars = [
  {
    title: "Human Reviewed Audits",
    body: "Every automated finding is checked by a real person before it reaches you — no fabricated scores.",
  },
  {
    title: "Your Data Stays Private",
    body: "We only measure what's publicly available about your store. Your data is never sold or resold.",
  },
  {
    title: "Transparent Submissions",
    body: "Every submission is tracked — where it went, when, and what came back, visible in your portal.",
  },
  {
    title: "Merchant Stories",
    body: "Real merchants, real outcomes. We share honest results, not inflated marketing numbers.",
  },
];

export default function RealReviews() {
  return (
    <section className="border-b border-borderCustom py-20 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="max-w-[560px]">
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
            Trust
          </span>
          <h2 className="mt-4 font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.1] tracking-tight text-balance">
            Built on real reviews.
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-textSecondary">
            GiftGrid buying — we&apos;d rather tell you the hard truth than manufacture
            numbers to win.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-xl border border-borderCustom bg-secondary p-6"
            >
              <h3 className="text-[16px] font-semibold text-textPrimary">
                {pillar.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-textSecondary">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
