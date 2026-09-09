import type { Metadata } from "next";
import PageSections from "@/components/public/PageSections";
import { siteConfig } from "@/config/branding";
import Header from "@/components/shared/Header";
import SiteFooter from "@/components/shared/SiteFooter";
import HomepageCommunityRedirect from "@/components/public/HomepageCommunityRedirect";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GiftGrid — Corporate Gifting Opportunities for Growing Brands",
  description: siteConfig.description,
};

export default async function HomePage() {
  return (
    <div className="site-themed min-h-screen">
      <HomepageCommunityRedirect />
      <Header />
      <main className="overflow-hidden"><PageSections path="/" /></main>
      <SiteFooter />
    </div>
  );
}
