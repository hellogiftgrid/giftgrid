import CommunityFeed from "@/components/public/CommunityFeed";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "GiftGrid Community | GiftGrid",
  description: "Meet independent brands, share practical ideas, and build better gifting conversations with GiftGrid.",
};

export default async function CommunityPage() {
  return <main className="min-h-screen bg-[#f0f2f5]"><CommunityFeed /></main>;
}
