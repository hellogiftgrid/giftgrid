import SiteFooter from "@/components/shared/SiteFooter";
import Header from "@/components/shared/Header";
import ChatWidget from "@/components/shared/ChatWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site-themed min-h-screen">
      <Header />
      {children}
      <SiteFooter />
      <ChatWidget />
    </div>
  );
}
