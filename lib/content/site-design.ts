export type SiteDesign = {
  accent: string;
  pageBackground: string;
  headingColor: string;
  bodyColor: string;
  fontFamily: string;
  desktopHeroHeight: number;
  mobileHeroHeight: number;
  desktopHeroAlign: "left" | "center";
  mobileHeroAlign: "left" | "center";
  heroOverlay: number;
  sectionSpacing: number;
  cardRadius: number;
  buttonRadius: number;
  containerWidth: number;
  headerHeight: number;
  desktopTitleSize: number;
  mobileTitleSize: number;
  desktopBodySize: number;
  mobileBodySize: number;
  desktopPagePadding: number;
  mobilePagePadding: number;
  cardPadding: number;
  buttonHeight: number;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  merchantButton: string;
  bookingButton: string;
};

export const defaultSiteDesign: SiteDesign = {
  accent: "#1d4ed8",
  pageBackground: "#ffffff",
  headingColor: "#0f172a",
  bodyColor: "#475569",
  fontFamily: "Canva Sans",
  desktopHeroHeight: 760,
  mobileHeroHeight: 620,
  desktopHeroAlign: "left",
  mobileHeroAlign: "left",
  heroOverlay: 42,
  sectionSpacing: 96,
  cardRadius: 20,
  buttonRadius: 999,
  containerWidth: 1280,
  headerHeight: 60,
  desktopTitleSize: 72,
  mobileTitleSize: 42,
  desktopBodySize: 20,
  mobileBodySize: 17,
  desktopPagePadding: 40,
  mobilePagePadding: 20,
  cardPadding: 28,
  buttonHeight: 50,
  heroEyebrow: "The unboxing experience",
  heroTitle: "Make every gift feel worth opening.",
  heroDescription: "GiftGrid brings standout brands and workplace gifting teams together for gifts people genuinely want to receive.",
  merchantButton: "Apply as a Merchant",
  bookingButton: "Book a Call",
};

export function normalizeSiteDesign(value: unknown): SiteDesign {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string,unknown> : {};
  const result = { ...defaultSiteDesign };
  const ranges: Record<string,[number,number]> = {
    desktopHeroHeight:[440,1000],mobileHeroHeight:[360,820],heroOverlay:[0,80],sectionSpacing:[0,180],cardRadius:[0,40],buttonRadius:[0,999],containerWidth:[960,1600],headerHeight:[48,96],desktopTitleSize:[32,112],mobileTitleSize:[24,72],desktopBodySize:[14,30],mobileBodySize:[13,24],desktopPagePadding:[16,96],mobilePagePadding:[12,40],cardPadding:[12,64],buttonHeight:[40,72]
  };
  for (const key of Object.keys(defaultSiteDesign) as (keyof SiteDesign)[]) {
    const raw=input[key];
    if (ranges[key]) {const [min,max]=ranges[key];if(typeof raw==='number' && Number.isFinite(raw)) (result as unknown as Record<string,unknown>)[key]=Math.min(max,Math.max(min,raw));}
    else if (key==='desktopHeroAlign'||key==='mobileHeroAlign') {if(raw==='left'||raw==='center')result[key]=raw;}
    else if (key==='fontFamily') {if(typeof raw==='string'&&['Canva Sans','Inter','Arial'].includes(raw))result.fontFamily=raw;}
    else if (['accent','pageBackground','headingColor','bodyColor'].includes(key)) {if(typeof raw==='string'&&/^#[a-f0-9]{6}$/i.test(raw))(result as unknown as Record<string,unknown>)[key]=raw;}
    else if(typeof raw==='string') (result as unknown as Record<string,unknown>)[key]=raw.slice(0,key==='heroDescription'?2000:300);
  }
  return result;
}
