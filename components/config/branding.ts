// GiftGrid design tokens — single source of truth.
// Referenced by tailwind.config.ts. Change values here, not in components.
// Light, colorful marketplace identity (v2) — replaces the dark/gold v1 palette.

export const colors = {
  // Page + surfaces
  primary: "#F8FAFC",        // page background — soft off-white
  secondary: "#FFFFFF",      // card / surface
  secondarySoft: "#F1F5F9",  // banded section background

  // Text
  textPrimary: "#0F172A",    // deep navy, near-black
  textSecondary: "#64748B",  // slate gray

  // Borders
  borderCustom: "#E2E8F0",

  // Brand accents — gradient duo used across CTAs, icons, the logomark
  accent: "#4F46E5",         // indigo — primary accent
  accentAlt: "#F97316",      // orange — secondary accent, used sparingly
  accentDim: "#4338CA",

  // Status
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#EF4444",

  // Footer intentionally inverts for contrast, like most marketplace sites
  footerBg: "#0F172A",
  footerText: "#F8FAFC",
  footerTextSecondary: "#94A3B8",
  footerBorder: "#1E293B",
} as const;

export const fonts = {
  display: ["Sora", "sans-serif"],
  body: ["Inter", "system-ui", "sans-serif"],
  mono: ['"IBM Plex Mono"', "monospace"],
} as const;

export const siteConfig = {
  name: "GiftGrid",
  tagline: "Prepare. Connect. Pursue.",
  description:
    "GiftGrid helps e-commerce brands prepare, review, and position their stores for opportunities within the corporate gifting ecosystem.",
  supportEmail: "support@degiftgrid.com",
};

export const opportunityCategories = [
  "Corporate Gifting",
  "Bulk Buyers",
  "Wholesale",
  "Retail",
  "Corporate Procurement",
  "Distributors",
  "Employee Reward Platforms",
  "Hospitality",
  "Events",
] as const;

export const opportunityCategoryDescriptions: Record<(typeof opportunityCategories)[number], string> = {
  "Corporate Gifting": "Curated holiday and milestone gifting programs for companies buying at scale.",
  "Bulk Buyers": "Buyers looking to purchase large quantities direct from your store.",
  Wholesale: "Wholesale accounts that stock and resell your products.",
  Retail: "Retail partners looking to carry your brand in-store or online.",
  "Corporate Procurement": "Procurement teams sourcing vendors for recurring business needs.",
  Distributors: "Distribution partners to help your products reach new regions and channels.",
  "Employee Reward Platforms": "Rewards and recognition platforms that feature merchandise for employees.",
  Hospitality: "Hotels, airlines, and hospitality brands sourcing amenities and guest gifts.",
  Events: "Conference, trade show, and event organizers sourcing branded merchandise.",
};

// Real, factual capability claim — GiftGrid can review stores on these
// platforms. Not a claim of partnership or endorsement.
export const supportedPlatforms = [
  "Shopify",
  "WooCommerce",
  "BigCommerce",
  "Magento",
  "Wix",
] as const;
