import type { MetadataRoute } from "next";

const SITE_URL = "https://www.degiftgrid.com";

const routes = [
  "/",
  "/about",
  "/giftgrid",
  "/how-it-works",
  "/store-review",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/blog",
  "/blog/corporate-gifting-readiness-checklist",
  "/blog/how-to-audit-your-online-store",
  "/blog/signs-your-store-is-not-ready",
  "/blog/create-gift-bundles",
  "/blog/what-makes-a-store-buyer-ready",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => {
    const isHomepage = route === "/";
    const isBlogArticle = route.startsWith("/blog/");

    return {
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: isHomepage
        ? "weekly"
        : isBlogArticle
          ? "monthly"
          : "monthly",
      priority: isHomepage
        ? 1
        : route === "/blog"
          ? 0.9
          : isBlogArticle
            ? 0.8
            : 0.7,
    };
  });
}
