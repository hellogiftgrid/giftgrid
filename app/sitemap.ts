import type { MetadataRoute } from "next";

const SITE_URL = "https://www.degiftgrid.com";

const publicRoutes = [
  "/",
  "/about",
  "/how-it-works",
  "/store-review",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/blog",
];

const blogRoutes = [
  "/blog/corporate-gifting-readiness-checklist",
  "/blog/how-to-audit-your-online-store",
  "/blog/signs-your-store-is-not-ready",
  "/blog/create-gift-bundles",
  "/blog/what-makes-a-store-buyer-ready",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...publicRoutes, ...blogRoutes].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority:
      route === "/"
        ? 1
        : route === "/blog"
          ? 0.9
          : route.startsWith("/blog/")
            ? 0.8
            : 0.7,
  }));
}
