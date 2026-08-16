import { opportunityCategories } from "@/config/branding";

const gradients = [
  ["#4F46E5", "#818CF8"],
  ["#F97316", "#FBBF24"],
  ["#0EA5E9", "#38BDF8"],
  ["#EC4899", "#F472B6"],
  ["#16A34A", "#4ADE80"],
  ["#8B5CF6", "#C4B5FD"],
  ["#F43F5E", "#FB7185"],
  ["#0D9488", "#5EEAD4"],
  ["#EA580C", "#FDBA74"],
];

export default function CategoryGrid() {
  return (
    <section id="network" className="py-24">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="mb-14 max-w-[560px]">
          <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-accent">Opportunity Network</span>
          <h2 className="mt-3.5 font-display text-[clamp(28px,3.4vw,40px)] font-bold tracking-tight text-textPrimary">
            Every opportunity, mapped to your store.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-textSecondary">
            GiftGrid manages relationships across nine categories of buyers — you don&apos;t need to know which
            one fits. We do the matching.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {opportunityCategories.map((category, i) => {
            const [from, to] = gradients[i % gradients.length];
            return (
              <div
                key={category}
                className="flex aspect-[4/3] flex-col justify-end rounded-2xl p-6 text-white shadow-sm transition-transform hover:-translate-y-1"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                <span className="text-[15px] font-semibold">{category}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
