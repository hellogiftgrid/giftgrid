import Link from "next/link";
import AdminQuoteNotifications from "@/components/admin/AdminQuoteNotifications";

const sections = [
  { heading: "Operations", links: [{href:"/admin/applications",label:"Applications"},{href:"/admin/merchants",label:"Merchants"},{href:"/admin/opportunities",label:"Opportunities"},{href:"/admin/marketplace",label:"Buyer Marketplace"},{href:"/admin/community",label:"Community moderation"}] },
  {
    heading: "Overview",
    links: [
      { href: "/admin", label: "Dashboard" },
    ],
  },
  
  {
    heading: "Communication",
    links: [
      { href: "/admin/messages", label: "Merchant Messages" },
      { href: "/admin/support", label: "Support / Experts" },
    ],
  },
  {
    heading: "Content",
    links: [
      { href: "/admin/content", label: "Website Content" },
      { href: "/admin/blog", label: "Blog Publishing" },
      { href: "/admin/design", label: "Website Design" },
    ],
  },
];

export default function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <img
                src="/images/logo-full.png"
                alt="GiftGrid"
                className="theme-logo h-8 w-8 object-contain"
              />
            </div>

            <div>
              <div className="font-bold text-slate-950">
                GiftGrid
              </div>
              <div className="text-xs font-semibold text-[#0F766E]">
                Admin
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <AdminQuoteNotifications />
          {sections.map((section) => (
            <div key={section.heading} className="mb-7">
              <div className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {section.heading}
              </div>

              <div className="mt-2 space-y-1">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-[#0F766E]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <Link
            href="/dashboard"
            className="block rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Merchant Portal
          </Link>
        </div>
      </div>
    </aside>
  );
}
