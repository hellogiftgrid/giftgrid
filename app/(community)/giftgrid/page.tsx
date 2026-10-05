import CommunityFeed from "@/components/public/CommunityFeed";

export const metadata = {
  title: "GiftGrid Community",
  description: "Connect, share, and discover practical gifting ideas with the GiftGrid community.",
  alternates: {
    canonical: "https://community.degiftgrid.com/",
  },
};

export default function GiftGridPage() {
  return <main className="min-h-screen bg-[#f0f2f5]"><CommunityFeed /></main>;
}
