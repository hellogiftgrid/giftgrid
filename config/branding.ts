// GiftGrid design tokens — single source of truth.
// Light, bright marketplace identity with high-contrast text and crisp actions.

export const colors = {
  // Page + surfaces
  primary: "#FFFFFF",        // Clean bright white page base
  secondary: "#F8FAFC",      // Soft light gray for card surfaces
  secondarySoft: "#F1F5F9",  // Subtle slate panel backgrounds

  // Text
  textPrimary: "#0F172A",    // Deep obsidian navy for headers
  textSecondary: "#475569",  // Dark slate for paragraphs

  // Borders
  borderCustom: "#CBD5E1",   

  // Brand accents
  accent: "#4F46E5",         
  accentAlt: "#EA580C",      
  accentDim: "#3730A3",      

  // Status
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",

  // Footer
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
  supportEmail: "hellogiftgrid@gmail.com",
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

// Verified mapping file matching your exact folder system setup
export const opportunityImages: Record<string, string> = {
  "Corporate Gifting": "/images/coporate gifting.jfif",
  "Bulk Buyers": "/images/bulk buyers.jfif", 
  "Wholesale": "/images/whosale.jfif",
  "Retail": "/images/retail.jfif",
  "Corporate Procurement": "/images/coporate procurement.jfif",
  "Distributors": "/images/distributors.jfif",
  "Employee Reward Platforms": "/images/employee reward platform.jfif",
  "Hospitality": "/images/hosppitality.jfif", 
  "Events": "/images/events.jfif",
};

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

// Fixed to ensure paths don't use raw blank spaces that encode into broken %20 links!
export const supportedPlatforms = [
  { name: "Shopify", slug: "shopify.png" },
  { name: "WooCommerce", slug: "woocommerce.png" },
  { name: "BigCommerce", slug: "big_commerce.jfif" }, // Linked to snake_case format
  { name: "Magento", slug: "magento.jfif" },
  { name: "Wix", slug: "wix.png" },
] as const;

export const partnerNetwork = [
  { name: "Goody", slug: "goody" },
  { name: "Sendoso", slug: "sendoso" },
  { name: "Snappy", slug: "snappy", chip: "dark" },
  { name: "Guusto", slug: "guusto" },
  { name: "Stadium", slug: "stadium" },
  { name: "Gifted.co", slug: "gifted" },
] as const;
