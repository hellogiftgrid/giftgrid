"use client";

/**
 * DashboardShell — social-style layout (X / FB / IG inspired)
 *
 * Role layers:
 *   merchant     → Merchant Workspace
 *   admin        → Platform Operations
 *   super_admin  → Full Control
 *   developer    → Console
 *
 * Layout:
 *   Desktop: icon sidebar (lg) → full sidebar (xl) + top header
 *   Mobile:  top header + bottom tab bar (IG-style)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type DashboardRole = "merchant" | "admin" | "super_admin" | "developer";

type Props = {
  role: DashboardRole;
  fullName: string;
  email: string;
  children: ReactNode;
  avatarUrl?: string;
  unreadCount?: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles: DashboardRole[];
  badge?: boolean;
};

const NAV: NavItem[] = [
  // Shared
  { href: "/dashboard",             label: "Home",             icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", roles: ["merchant","admin","super_admin","developer"] },
  { href: "/community",             label: "Community",        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", roles: ["merchant","admin","super_admin","developer"] },
  { href: "/dashboard/comms",       label: "Messages",         icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", roles: ["merchant","admin","super_admin"], badge: true },
  { href: "/dashboard/profile",     label: "Profile",          icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", roles: ["merchant","admin","super_admin","developer"] },

  // Merchant
  { href: "/dashboard/audit",            label: "Store Review",      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", roles: ["merchant"] },
  { href: "/dashboard/recommendations",  label: "Recommendations",   icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", roles: ["merchant"] },
  { href: "/dashboard/listings",         label: "Listings",          icon: "M4 6h16M4 10h16M4 14h16M4 18h16", roles: ["merchant"] },
  { href: "/dashboard/connections",      label: "Buyer Connections", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", roles: ["merchant"] },
  { href: "/dashboard/documents",        label: "Documents",         icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z", roles: ["merchant"] },
  { href: "/dashboard/workflow",         label: "Workflow",          icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7", roles: ["merchant"] },

  // Admin
  { href: "/dashboard/applications", label: "Applications",    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", roles: ["admin","super_admin"] },
  { href: "/dashboard/audits",       label: "Audits",          icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", roles: ["admin","super_admin"] },
  { href: "/dashboard/merchants",    label: "Merchants",       icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", roles: ["admin","super_admin"] },
  { href: "/dashboard/calls",        label: "Calls",           icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", roles: ["admin","super_admin"] },
  { href: "/dashboard/support",      label: "Support",         icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", roles: ["admin","super_admin"] },
  { href: "/dashboard/content",      label: "Content",         icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", roles: ["admin","super_admin"] },

  // Super admin
  { href: "/dashboard/users",    label: "Users & Access", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", roles: ["super_admin"] },
  { href: "/dashboard/activity", label: "Activity Log",   icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", roles: ["super_admin"] },
  { href: "/dashboard/system",   label: "System",         icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", roles: ["super_admin"] },

  // Developer (console)
  { href: "/console",           label: "Console",   icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", roles: ["developer","super_admin"] },
  { href: "/console/keys",      label: "API Keys",  icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", roles: ["developer","super_admin"] },
  { href: "/console/webhooks",  label: "Webhooks",  icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", roles: ["developer","super_admin"] },
  { href: "/console/sandbox",   label: "Sandbox",   icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", roles: ["developer","super_admin"] },
];

function roleBadge(role: DashboardRole) {
  const map = {
    merchant:    ["Merchant",     "bg-indigo-100 text-indigo-700"],
    admin:       ["Admin",        "bg-amber-100 text-amber-700"],
    super_admin: ["Super Admin",  "bg-rose-100 text-rose-700"],
    developer:   ["Developer",    "bg-emerald-100 text-emerald-700"],
  } as const;
  return map[role];
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0" aria-hidden>
      <path d={d} />
    </svg>
  );
}

function Avatar({ name, url, size = "md" }: { name: string; url?: string; size?: "sm"|"md" }) {
  const px = size === "sm" ? "size-8 text-xs" : "size-10 text-sm";
  if (url) return <img src={url} alt={name} className={`${px} rounded-full object-cover`} />;
  return (
    <div className={`${px} flex shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white`}>
      {name.slice(0,1).toUpperCase()}
    </div>
  );
}

function NavLink({ item, unreadCount }: { item: NavItem; unreadCount?: number }) {
  const pathname = usePathname();
  const active = pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
  return (
    <Link href={item.href}
      className={["group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-semibold transition-all",
        active ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"].join(" ")}
    >
      <span className={`relative ${active ? "text-slate-950" : "text-slate-500 group-hover:text-slate-800"}`}>
        <Icon d={item.icon} />
        {item.badge && (unreadCount ?? 0) > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">{unreadCount}</span>
        )}
      </span>
      <span className="hidden xl:block">{item.label}</span>
    </Link>
  );
}

export default function DashboardShell({ role, fullName, email, avatarUrl, unreadCount, children }: Props) {
  const items = NAV.filter(i => i.roles.includes(role));
  const shared   = items.filter(i => ["/dashboard","/community","/dashboard/comms","/dashboard/profile"].includes(i.href));
  const workspace = items.filter(i => !shared.includes(i) && !i.href.startsWith("/console"));
  const devItems  = items.filter(i => i.href.startsWith("/console"));
  const [badgeLabel, badgeColor] = roleBadge(role);

  return (
    <div className="h-screen overflow-hidden bg-[#F7F9FC]">
      <div className="flex h-full min-h-0">

        {/* ── Sidebar ── */}
        <aside className="hidden h-full w-[72px] shrink-0 flex-col border-r border-slate-200 bg-white xl:w-[260px] lg:flex">
          <div className="border-b border-slate-100 px-4 py-5 xl:px-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                <img src="/images/logo-full.png" alt="GiftGrid" className="size-8 object-contain" />
              </div>
              <span className="hidden text-lg font-bold text-slate-950 xl:block">GiftGrid</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 xl:px-4">
            <div className="space-y-0.5">
              {shared.map(item => <NavLink key={item.href} item={item} unreadCount={unreadCount} />)}
            </div>
            {workspace.length > 0 && (
              <>
                <div className="my-3 hidden px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 xl:block">
                  {role === "admin" || role === "super_admin" ? "Operations" : "Workspace"}
                </div>
                <div className="my-3 border-t border-slate-100 xl:hidden" />
                <div className="space-y-0.5">
                  {workspace.map(item => <NavLink key={item.href} item={item} />)}
                </div>
              </>
            )}
            {devItems.length > 0 && (
              <>
                <div className="my-3 hidden px-3 text-[10px] font-bold uppercase tracking-widest text-emerald-600 xl:block">Developer Console</div>
                <div className="my-3 border-t border-slate-100 xl:hidden" />
                <div className="space-y-0.5">
                  {devItems.map(item => <NavLink key={item.href} item={item} />)}
                </div>
              </>
            )}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={fullName} url={avatarUrl} />
              <div className="hidden min-w-0 xl:block">
                <p className="truncate text-sm font-bold text-slate-900">{fullName}</p>
                <p className="truncate text-xs text-slate-400">{email}</p>
              </div>
            </div>
            <div className="mt-3 hidden grid-cols-2 gap-2 xl:grid">
              <Link href="/book" className="rounded-xl bg-indigo-600 px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-indigo-700">Book a Call</Link>
              <a href="/auth/sign-out" className="rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50">Sign out</a>
            </div>
            <span className={`mt-3 hidden rounded-full px-2 py-0.5 text-[10px] font-bold xl:inline-flex ${badgeColor}`}>{badgeLabel}</span>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex min-h-14 items-center justify-between gap-4 px-4 lg:px-6">
              <Link href="/dashboard" className="lg:hidden">
                <img src="/images/logo-full.png" alt="GiftGrid" className="size-8 object-contain" />
              </Link>
              <span className={`hidden rounded-full px-3 py-1 text-xs font-bold lg:inline-flex ${badgeColor}`}>{badgeLabel}</span>
              <div className="flex items-center gap-2 lg:gap-3">
                <Link href="/book" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">Book a Call</Link>
                <Avatar name={fullName} url={avatarUrl} size="sm" />
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 pb-20 lg:px-6 lg:pb-6 lg:py-8">{children}</main>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {items.slice(0,5).map(item => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const pathname = usePathname();
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            return (
              <Link key={item.href} href={item.href}
                className={`relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 ${active ? "text-slate-950" : "text-slate-400"}`}>
                <Icon d={item.icon} />
                <span className="text-[9px] font-semibold">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
