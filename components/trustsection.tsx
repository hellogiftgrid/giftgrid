const cards = [
  {
    title: "Human-Reviewed Audits",
    body: "Every audit is checked by our team before it reaches you. No automated scores presented as final.",
    icon: <path d="M9 12l2 2 4-4" />,
    iconExtra: <circle cx="12" cy="12" r="9" />,
  },
  {
    title: "Your Data Stays Private",
    body: "Row-level access control means merchants only ever see their own information — never another brand's.",
    icon: <rect x="4" y="11" width="16" height="9" rx="1.5" />,
    iconExtra: <path d="M8 11V7a4 4 0 0 1 8 0v4" />,
  },
  {
    title: "Transparent Submissions",
    body: "Every opportunity submission is tracked — where it went, when, and what came back.",
    icon: <path d="M4 12h11M15 12l-4-4M15 12l-4 4" />,
    iconExtra: <rect x="15" y="4" width="5" height="16" rx="1" />,
  },
];

export default function TrustSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="mb-14 max-w-[600px]">
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">Why Merchants Trust GiftGrid</span>
          <h2 className="mt-3.5 font-display text-[clamp(26px,3vw,36px)] font-semibold tracking-tight">
            Built on real reviews, not fabricated scores.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-textSecondary">
            GiftGrid is early — we&apos;d rather tell you that plainly than manufacture numbers to look established.
          </p>
        </div>

        <div className="grid gap-4.5 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.title} className="rounded-md border border-borderCustom bg-secondary p-7">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mb-4.5 text-accent">
                {c.icon}
                {c.iconExtra}
              </svg>
              <h3 className="mb-2.5 text-[16px] font-semibold">{c.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-textSecondary">{c.body}</p>
            </div>
          ))}

          <div className="flex flex-col justify-between rounded-md border border-dashed border-borderCustom p-7">
            <div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mb-4.5 text-accent">
                <path d="M8 10h8M8 14h5" />
                <path d="M21 12a9 9 0 1 1-4.5-7.8" />
              </svg>
              <h3 className="mb-2.5 text-[16px] font-semibold">Merchant Stories</h3>
              <p className="text-[13.5px] leading-relaxed text-textSecondary">
                Reviews and case studies will appear here as our network grows.
              </p>
            </div>
            <span className="mt-4 inline-block w-fit rounded-full border border-borderCustom px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide text-textSecondary">
              Managed in Admin
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
