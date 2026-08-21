import Link from "next/link";

export const metadata = {
  title: "GiftGrid Blog | E-commerce, Corporate Gifting & Store Readiness",
  description:
    "Practical guidance for e-commerce brands preparing for corporate gifting, improving store readiness, and connecting with business buyers.",
};

const posts = [
  {
    slug: "corporate-gifting-readiness-checklist",
    title:
      "The Corporate Gifting Readiness Checklist for E-commerce Brands",
    excerpt:
      "What buyers look for before they trust an online store with corporate gifting orders.",
  },
  {
    slug: "how-to-audit-your-online-store",
    title:
      "How to Audit Your Online Store Before Approaching Corporate Buyers",
    excerpt:
      "A practical framework for reviewing presentation, brand identity, products, operations, and compliance.",
  },
  {
    slug: "signs-your-store-is-not-ready",
    title:
      "7 Signs Your E-commerce Store Is Not Ready for Corporate Gifting",
    excerpt:
      "From weak product presentation to missing business policies, these gaps can affect buyer confidence.",
  },
  {
    slug: "create-gift-bundles",
    title:
      "How to Create Gift Bundles That Work for Corporate Buyers",
    excerpt:
      "Why curated bundles make it easier for companies to understand, purchase, and repeat gift orders.",
  },
  {
    slug: "what-makes-a-store-buyer-ready",
    title:
      "What Makes an E-commerce Store Buyer-Ready?",
    excerpt:
      "The foundations of a professional storefront that can support wholesale, corporate, and gifting opportunities.",
  },
];

export default function BlogPage() {
  return (
    <main className="bg-[#F7F9FC]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4F46E5]">
            GiftGrid Journal
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Build a store that is ready for bigger opportunities.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Practical ideas for e-commerce brands working toward stronger
            presentation, corporate gifting readiness, and better buyer
            conversations.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4F46E5]">
                GiftGrid Insights
              </p>

              <h2 className="mt-3 text-2xl font-bold leading-tight text-slate-950">
                {post.title}
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {post.excerpt}
              </p>

              <Link
                href={`/blog/${post.slug}`}
                className="mt-6 inline-flex items-center rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4338CA]"
              >
                Read article →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
