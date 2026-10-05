import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "GiftGrid",
    short_name: "GiftGrid",
    description: "Discover gift products, merchants, and corporate gifting tools.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/giftgrid-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/giftgrid-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
