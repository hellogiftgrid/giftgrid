export type SiteSection = {
  id: string;
  type: "announcement" | "text" | "image_text" | "gallery" | "spacer";
  visible: boolean;
  eyebrow?: string;
  title?: string;
  body?: string;
  background?: string;
  color?: string;
  padding?: number;
  height?: number;
  align?: "left" | "center";
  imageUrl?: string;
  imagePosition?: "left" | "right";
  buttonLabel?: string;
  buttonUrl?: string;
  items?: string[];
  speed?: number;
  contentWidth?: number;
  desktopHeight?: number;
  mobileHeight?: number;
  imageHeight?: number;
  titleSize?: number;
  textSize?: number;
};

export const defaultSections: SiteSection[] = [];

export function normalizeSections(input: unknown): SiteSection[] {
  if (!Array.isArray(input)) return defaultSections;
  return input.filter((item) => item && typeof item === "object" && typeof item.id === "string" && item.type !== "announcement").slice(0, 30) as SiteSection[];
}
