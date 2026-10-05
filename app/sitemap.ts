import { getArticles } from "@/lib/blog/articles";
import type { MetadataRoute } from "next";

const SITE_URL = "https://www.degiftgrid.com";

const routes = [
  "/",
  "/giftgrid",
  "/about",
  "/how-it-works",
  "/faq",
  "/contact",
  "/blog",

  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();
  return [...routes, ...articles.map(a => `/blog/${a.slug}`)].map((route) => ({
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
