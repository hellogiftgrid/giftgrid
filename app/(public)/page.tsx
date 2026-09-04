import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import PlatformStrip from "@/components/landing/PlatformStrip";
import TeamGifting from "@/components/landing/TeamGifting";
import GlobalSourcing from "@/components/landing/GlobalSourcing";
import OpportunityNetwork from "@/components/landing/OpportunityNetwork";
import Analytics from "@/components/landing/Analytics";
import RealReviews from "@/components/landing/RealReviews";
import EmployeeRecognition from "@/components/landing/EmployeeRecognition";
import FinalCTA from "@/components/landing/FinalCTA";

export const metadata: Metadata = {
  title: "GiftGrid — Position Your Brand for Corporate Gifting Opportunities",
  description:
    "GiftGrid helps e-commerce brands prepare, review, and position their stores for opportunities within the corporate gifting ecosystem.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <PlatformStrip />
      <TeamGifting />
      <GlobalSourcing />
      <OpportunityNetwork />
      <Analytics />
      <RealReviews />
      <EmployeeRecognition />
      <FinalCTA />
    </>
  );
}
