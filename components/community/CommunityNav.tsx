"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { communityUrl } from "@/config/community";

const items=[
  {name:"Home",path:"/",icon:"M3 11 12 3l9 8v10h-6v-7H9v7H3V11Z"},
  {name:"Market",path:"/market",icon:"M3 9h18M5 9v12h14V9M3 9l2-6h14l2 6M9 21v-7h6v7"},
{name:"Open Requests",path:"/sourcing",icon:"M7 3h10l4 4v14H3V3h4Zm3 7h8m-8 4h8m-8 4h5"},
  {name:"Profile",path:"/dashboard/profile",icon:"M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 22v-2a9 9 0 0 1 18 0v2"},
  {name:"Dashboard",path:"/dashboard",icon:"M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z"},
  {name:"Merchants",path:"/merchant",icon:"M3 7h18v15H3V7ZM8 7V3h8v4M3 12h18M9 12v4h6v-4"},
];
export default function CommunityNav() {
  const pathname=usePathname();
  return <nav aria-label="Community navigation" className="lg:min-w-0">
    <ul className="flex flex-row gap-1 overflow-x-auto">{items.map(item=>{
      const active=item.path==="/" ? ["/","/community","/giftgrid"].includes(pathname) : pathname.startsWith(item.path);
      return <li key={item.name} className="min-w-0 flex-1"><Link href={communityUrl(item.path)} aria-current={active ? "page" : undefined} className={`flex min-h-10 flex-row items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition lg:min-h-10 lg:gap-2 lg:px-4 lg:text-sm ${active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6 shrink-0"><path d={item.icon} strokeLinecap="round" strokeLinejoin="round" /></svg><span>{item.name}</span></Link></li>;
    })}</ul>
  </nav>;
}
