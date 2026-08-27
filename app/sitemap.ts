import type { MetadataRoute } from "next";

const SITE_URL = "https://www.degiftgrid.com";

const routes = [
  "/",
  "/giftgrid",
  "/about",
  "/how-it-works",
  "/store-review",
  "/faq",
  "/contact",
  "/blog",

  "/blog/corporate-gifting-readiness-checklist",
  "/blog/create-gift-bundles",
  "/blog/how-to-audit-your-online-store",
  "/blog/signs-your-store-is-not-ready",
  "/blog/what-makes-a-store-buyer-ready",

  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "/" ? "weekly" : "monthly",
    priority:
      route === "/"
        ? 1
        : route === "/giftgrid"
          ? 0.95
          : route === "/blog"
            ? 0.9
            : route.startsWith("/blog/")
              ? 0.8
              : 0.7,
  }));
}
