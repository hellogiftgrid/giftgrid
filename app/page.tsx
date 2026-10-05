import type { Metadata } from "next";
import PageSections from "@/components/public/PageSections";
import { siteConfig } from "@/config/branding";
import Header from "@/components/shared/Header";
import SiteFooter from "@/components/shared/SiteFooter";
import OpenSourcingPanel from "@/components/public/OpenSourcingPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GiftGrid - The Community for Better Gifting",
  description: siteConfig.description,
};

export default async function HomePage() {
  return (
    <div className="site-themed min-h-screen">
      <Header />
      <main className="overflow-hidden"><PageSections path="/" /><OpenSourcingPanel /></main>
      <SiteFooter />
    </div>
  );
}
