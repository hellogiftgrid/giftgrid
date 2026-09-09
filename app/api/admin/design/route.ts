import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultSiteDesign, normalizeSiteDesign } from "@/lib/content/site-design";

const hex = /^#[0-9a-f]{6}$/i;
const fonts = ["Canva Sans", "Inter", "Arial"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role,is_active").eq("id", user.id).single();
  if (profile?.role !== "super_admin" || profile.is_active === false) {
    return NextResponse.json({ error: "Super-admin access required." }, { status: 403 });
  }

  const raw = normalizeSiteDesign(await request.json());
  const clean = {
    ...defaultSiteDesign,
    ...raw,
    accent: hex.test(raw.accent) ? raw.accent : defaultSiteDesign.accent,
    pageBackground: hex.test(raw.pageBackground) ? raw.pageBackground : defaultSiteDesign.pageBackground,
    headingColor: hex.test(raw.headingColor) ? raw.headingColor : defaultSiteDesign.headingColor,
    bodyColor: hex.test(raw.bodyColor) ? raw.bodyColor : defaultSiteDesign.bodyColor,
    fontFamily: fonts.includes(raw.fontFamily) ? raw.fontFamily : defaultSiteDesign.fontFamily,
    desktopHeroHeight: Math.min(1000, Math.max(560, Number(raw.desktopHeroHeight))),
    mobileHeroHeight: Math.min(820, Math.max(500, Number(raw.mobileHeroHeight))),
    heroOverlay: Math.min(75, Math.max(0, Number(raw.heroOverlay))),
    sectionSpacing: Math.min(140, Math.max(48, Number(raw.sectionSpacing))),
    cardRadius: Math.min(40, Math.max(0, Number(raw.cardRadius))),
    buttonRadius: Math.min(999, Math.max(0, Number(raw.buttonRadius))),
    containerWidth: Math.min(1600, Math.max(960, Number(raw.containerWidth))),
    headerHeight: Math.min(96, Math.max(48, Number(raw.headerHeight))),
    desktopTitleSize: Math.min(112, Math.max(40, Number(raw.desktopTitleSize))),
    mobileTitleSize: Math.min(72, Math.max(28, Number(raw.mobileTitleSize))),
    desktopBodySize: Math.min(30, Math.max(14, Number(raw.desktopBodySize))),
    mobileBodySize: Math.min(24, Math.max(13, Number(raw.mobileBodySize))),
    desktopPagePadding: Math.min(96, Math.max(16, Number(raw.desktopPagePadding))),
    mobilePagePadding: Math.min(40, Math.max(12, Number(raw.mobilePagePadding))),
    cardPadding: Math.min(64, Math.max(12, Number(raw.cardPadding))),
    buttonHeight: Math.min(72, Math.max(40, Number(raw.buttonHeight))),
  };

  const { error } = await supabase.from("settings").upsert({
    key: "site_design",
    value: clean,
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, design: clean });
}
