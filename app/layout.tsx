import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/branding";
import ChatWidget from "@/components/shared/ChatWidget";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import WebSiteJsonLd from "@/components/seo/WebSiteJsonLd";
import { createClient } from "@/lib/supabase/server";
import { normalizeSiteDesign } from "@/lib/content/site-design";
import DesignPreviewBridge from "@/components/public/DesignPreviewBridge";
import SitePagesProvider from "@/components/public/SitePagesProvider";
import { normalizePages } from "@/lib/content/site-pages";
import type { CSSProperties } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NativeAppBootstrap from "@/components/mobile/NativeAppBootstrap";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.degiftgrid.com"),
  title: {
    default: "GiftGrid | E-commerce Merchant Platform for Corporate Gifting",
    template: "%s | GiftGrid",
  },
  description:
    "GiftGrid connects brands, gifting teams, and partners through a practical community and shared workspace.",
  alternates: {
    canonical: "https://www.degiftgrid.com/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "GiftGrid | E-commerce Merchant Platform for Corporate Gifting",
    description:
      "GiftGrid connects brands, gifting teams, and partners through a practical community and shared workspace.",
    url: "https://www.degiftgrid.com/",
    siteName: "GiftGrid",
    images: [
      {
        url: "/images/logo-horizontal.png",
        alt: "GiftGrid",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GiftGrid | E-commerce Merchant Platform for Corporate Gifting",
    description:
      "GiftGrid connects brands, gifting teams, and partners through a practical community and shared workspace.",
    images: ["/images/logo-horizontal.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key,value").in("key", ["site_design", "site_pages", "site_sections"]);
  const values = new Map((data || []).map(item => [item.key, item.value]));
  const design = normalizeSiteDesign(values.get("site_design"));
  const pages = normalizePages(values.get("site_pages"), design, values.get("site_sections"));
  const theme = {
    "--site-accent": design.accent,
    "--site-page": design.pageBackground,
    "--site-heading": design.headingColor,
    "--site-body": design.bodyColor,
    "--site-font": `"${design.fontFamily}"`,
    "--site-space": `${design.sectionSpacing}px`,
    "--site-card-radius": `${design.cardRadius}px`,
    "--site-button-radius": `${design.buttonRadius}px`,
    "--hero-mobile-height": `${design.mobileHeroHeight}px`,
    "--hero-desktop-height": `${design.desktopHeroHeight}px`,
    "--site-container": `${design.containerWidth}px`,
    "--site-header-height": `${design.headerHeight}px`,
    "--hero-title-desktop": `${design.desktopTitleSize}px`,
    "--hero-title-mobile": `${design.mobileTitleSize}px`,
    "--hero-body-desktop": `${design.desktopBodySize}px`,
    "--hero-body-mobile": `${design.mobileBodySize}px`,
    "--site-padding-desktop": `${design.desktopPagePadding}px`,
    "--site-padding-mobile": `${design.mobilePagePadding}px`,
    "--site-card-padding": `${design.cardPadding}px`,
    "--site-button-height": `${design.buttonHeight}px`,
  } as CSSProperties;

  return (
    <html lang="en" data-scroll-behavior="smooth">
  <head>
    <link rel="preconnect" href="https://cal.com" />
    <link rel="preconnect" href="https://app.cal.com" crossOrigin="anonymous" />
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-4F8TJ70RR7"></script>
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-4F8TJ70RR7');
        `,
      }}
    />
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function(){
            try {
              var saved = localStorage.getItem('giftgrid-theme');
              var mode = saved === 'dark' || saved === 'light' || saved === 'auto' ? saved : 'auto';
              var hour = new Date().getHours();
              var theme = mode === 'auto' ? (hour >= 7 && hour < 19 ? 'light' : 'dark') : mode;
              document.documentElement.dataset.theme = theme;
              document.documentElement.style.colorScheme = theme;
            } catch (e) {}
          })();
        `,
      }}
    />
  </head>
  <body style={theme}>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <SitePagesProvider initial={pages}><DesignPreviewBridge />{children}</SitePagesProvider>
        <ChatWidget />
        <NativeAppBootstrap />
        <Analytics />
        <SpeedInsights />
</body>
    </html>
  );
}
