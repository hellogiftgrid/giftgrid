import type { Metadata } from "next";
import { Sora, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/branding";
import ChatWidget from "@/components/shared/ChatWidget";
import SiteFooter from "@/components/shared/SiteFooter";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import WebSiteJsonLd from "@/components/seo/WebSiteJsonLd";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.degiftgrid.com"),
  title: {
    default: "GiftGrid | E-commerce Merchant Platform for Corporate Gifting",
    template: "%s | GiftGrid",
  },
  description:
    "GiftGrid is an e-commerce merchant platform that helps brands audit their stores, improve buyer readiness, and prepare for corporate gifting, wholesale, and commercial opportunities.",
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
      "GiftGrid helps e-commerce merchants audit their stores, improve buyer readiness, and prepare for corporate gifting, wholesale, and commercial opportunities.",
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
      "GiftGrid helps e-commerce merchants audit their stores, improve buyer readiness, and prepare for corporate gifting, wholesale, and commercial opportunities.",
    images: ["/images/logo-horizontal.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${plexMono.variable}`}>
  <head>
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
  </head>
  <body>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {children}
        <ChatWidget />
              <SiteFooter />
</body>
    </html>
  );
}
