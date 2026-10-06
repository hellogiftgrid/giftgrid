import AuthControls from "@/components/shared/AuthControls";
import Link from "next/link";
import CommunityNav from "@/components/community/CommunityNav";
import { communityUrl } from "@/config/community";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <div className="community-shell min-h-screen min-w-0 bg-[#f0f2f5] text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <nav aria-label="Community navigation" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <Link href={communityUrl()} aria-label="GiftGrid Community"><img src="/images/logo-horizontal.png" alt="GiftGrid" className="theme-logo h-8 w-auto" /></Link>
        <div className="flex flex-wrap items-center gap-1 text-sm font-semibold text-slate-700">
          <Link href="/docs" className="rounded-lg px-3 py-3 text-blue-700">Docs</Link>
          <CommunityNav />
          <AuthControls />
        </div>
      </nav>
    </header>
    <div className="mx-auto grid max-w-[1440px] items-start gap-6 pb-16 lg:grid-cols-1 lg:px-6 lg:py-3 lg:pb-6">
      <div className="min-w-0">{children}</div>
    </div>
  </div>;
}
