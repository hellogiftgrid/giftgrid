import Link from "next/link";
import { notFound } from "next/navigation";

const posts = {
  "corporate-gifting-readiness-checklist": {
    title:
      "The Corporate Gifting Readiness Checklist for E-commerce Brands",
    intro:
      "Corporate buyers need more than attractive products. They need confidence that a merchant can present, communicate, and fulfil an order professionally.",
    sections: [
      {
        heading: "1. Store presentation",
        body:
          "Your homepage should quickly explain what you sell, who it is for, and why a buyer should trust you. Strong imagery, a clear opening statement, simple navigation, and mobile-friendly design all matter.",
      },
      {
        heading: "2. Brand identity",
        body:
          "A buyer should be able to understand your story, mission, positioning, and product philosophy. A strong About page can turn a product catalogue into a recognizable brand.",
      },
      {
        heading: "3. Product readiness",
        body:
          "Core products need accurate availability, useful descriptions, strong imagery, and clear purchasing options. Corporate buyers should not have to guess what is actually available.",
      },
      {
        heading: "4. Operational credibility",
        body:
          "Contact information, shipping information, returns, and a route for bulk or wholesale enquiries help demonstrate that the business is prepared for larger commercial relationships.",
      },
      {
        heading: "5. Compliance",
        body:
          "Privacy, terms, refunds, shipping, and other relevant policies should be easy to find and written clearly enough for customers and business buyers to understand.",
      },
    ],
  },

  "how-to-audit-your-online-store": {
    title:
      "How to Audit Your Online Store Before Approaching Corporate Buyers",
    intro:
      "A good store audit turns a subjective design review into a practical list of improvements.",
    sections: [
      {
        heading: "Start with what the buyer actually sees",
        body:
          "Review the homepage, primary navigation, product pages, mobile experience, and the speed of the path from discovery to purchase.",
      },
      {
        heading: "Review the brand story",
        body:
          "Look for a clear mission, About page, founder story, product positioning, and evidence that the store stands for something beyond individual products.",
      },
      {
        heading: "Check operational signals",
        body:
          "Review contact routes, returns, shipping, refunds, cancellation terms, and whether corporate or bulk buyers have an obvious way to start a conversation.",
      },
      {
        heading: "Turn findings into recommendations",
        body:
          "Every issue should explain what was checked, why it matters, and what the merchant should do next. That makes an audit actionable instead of merely critical.",
      },
    ],
  },

  "signs-your-store-is-not-ready": {
    title:
      "7 Signs Your E-commerce Store Is Not Ready for Corporate Gifting",
    intro:
      "A store can have good products and still look unprepared for a corporate buyer.",
    sections: [
      {
        heading: "1. The homepage does not explain the offer",
        body:
          "Visitors should understand the value proposition quickly.",
      },
      {
        heading: "2. Core products are unavailable",
        body:
          "Frequent sold-out products create uncertainty for business buyers who need predictable fulfilment.",
      },
      {
        heading: "3. There is no proper brand story",
        body:
          "A corporate buyer may want to understand who they are purchasing from, not just what they are purchasing.",
      },
      {
        heading: "4. There is no bulk or wholesale route",
        body:
          "A dedicated enquiry path can dramatically reduce friction for larger orders.",
      },
      {
        heading: "5. Policies are difficult to find",
        body:
          "Missing or hidden policies can reduce confidence.",
      },
      {
        heading: "6. Product descriptions are purely functional",
        body:
          "Gift buyers need context, use cases, and reasons to choose a product.",
      },
      {
        heading: "7. The mobile experience feels secondary",
        body:
          "A significant part of discovery happens on mobile, so presentation should work there too.",
      },
    ],
  },

  "create-gift-bundles": {
    title:
      "How to Create Gift Bundles That Work for Corporate Buyers",
    intro:
      "Bundles help companies understand the buying decision faster and can make gifting easier to repeat.",
    sections: [
      {
        heading: "Start with a clear use case",
        body:
          "Build bundles around occasions, recipient types, budgets, or company needs rather than simply grouping random products together.",
      },
      {
        heading: "Offer clear tiers",
        body:
          "Starter, standard, premium, and executive options can help corporate buyers compare quickly.",
      },
      {
        heading: "Make availability obvious",
        body:
          "A corporate buyer needs confidence that the bundle can actually be fulfilled.",
      },
      {
        heading: "Make the story part of the bundle",
        body:
          "Explain why the products belong together and how the package represents your brand.",
      },
    ],
  },

  "what-makes-a-store-buyer-ready": {
    title:
      "What Makes an E-commerce Store Buyer-Ready?",
    intro:
      "Buyer-readiness is the combination of product quality, presentation, operational credibility, and a clear route into a business conversation.",
    sections: [
      {
        heading: "Professional presentation",
        body:
          "Your storefront should feel intentional, trustworthy, and easy to navigate.",
      },
      {
        heading: "Strong products",
        body:
          "Products should be available, clearly described, well presented, and easy to purchase.",
      },
      {
        heading: "Business credibility",
        body:
          "Policies, contact options, and commercial information help a buyer understand how the relationship can work.",
      },
      {
        heading: "A path to opportunity",
        body:
          "A buyer-ready store should make it easy for a potential partner to start a conversation.",
      },
    ],
  },
} as const;

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = posts[params.slug as keyof typeof posts];

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.intro,
    alternates: {
      canonical: `https://www.degiftgrid.com/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.intro,
      url: `https://www.degiftgrid.com/blog/${params.slug}`,
      siteName: "GiftGrid",
      type: "article",
      images: [
        {
          url: "https://www.degiftgrid.com/images/logo-horizontal.png",
          alt: "GiftGrid",
        },
      ],
    },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = posts[params.slug as keyof typeof posts];

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `https://www.degiftgrid.com/blog/${params.slug}#article`,
    headline: post.title,
    description: post.intro,
    url: `https://www.degiftgrid.com/blog/${params.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.degiftgrid.com/blog/${params.slug}`,
    },
    image: [
      "https://www.degiftgrid.com/images/logo-horizontal.png",
    ],
    author: {
      "@type": "Organization",
      "@id": "https://www.degiftgrid.com/#organization",
      name: "GiftGrid",
    },
    publisher: {
      "@type": "Organization",
      "@id": "https://www.degiftgrid.com/#organization",
      name: "GiftGrid",
      logo: {
        "@type": "ImageObject",
        url: "https://www.degiftgrid.com/images/logo-horizontal.png",
      },
    },
  };

  return (
    <main className="bg-[#F7F9FC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <article className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <Link
          href="/blog"
          className="text-sm font-bold text-[#4F46E5]"
        >
          ← Back to GiftGrid Blog
        </Link>

        <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#4F46E5]">
          GiftGrid Insights
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
          {post.title}
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600">
          {post.intro}
        </p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="space-y-9">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-bold text-slate-950">
                  {section.heading}
                </h2>

                <p className="mt-3 text-base leading-8 text-slate-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-indigo-50 p-7">
          <h2 className="text-xl font-bold text-slate-950">
            Ready to improve your store?
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            GiftGrid helps merchants review their storefronts and
            prepare for stronger gifting and business opportunities.
          </p>

          <Link
            href="/auth/sign-up"
            className="mt-5 inline-flex rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white hover:bg-[#4338CA]"
          >
            Apply as a Merchant →
          </Link>
        </div>
      </article>
    </main>
  );
}
