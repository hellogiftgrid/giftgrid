import SiteFooter from "@/components/shared/SiteFooter";
import Header from "@/components/shared/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
