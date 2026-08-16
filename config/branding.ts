// GiftGrid design tokens — single source of truth.
// Referenced by tailwind.config.ts. Change values here, not in components.

export const colors = {
  primary: "#0B0F19",       // deep charcoal blue — base background
  secondary: "#1E293B",     // deep navy slate — card/section surface
  secondarySoft: "#161F30", // slightly lighter than primary, for banded sections
  accent: "#D4AF37",        // brushed gold — restrained accent only
  accentDim: "#8A7326",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  borderCustom: "#334155",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
} as const;

export const fonts = {
  display: ["Fraunces", "serif"],
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
