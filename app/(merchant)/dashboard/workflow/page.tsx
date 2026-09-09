"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
type WorkItem = { id: string; title: string; detail: string; status: string; href: string };

export default function TeamWorkflowPage() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setLoading(false);
    const { data: merchant } = await supabase.from("merchant_profiles").select("id").eq("profile_id", auth.user.id).single();
    if (!merchant) return setLoading(false);
    const [{ data: listings }, { data: inquiries }, { data: submissions }] = await Promise.all([
      supabase.from("merchant_listings").select("id, title, status").eq("merchant_id", merchant.id),
      supabase.from("buyer_inquiries").select("id, subject, status").eq("merchant_id", merchant.id),
      supabase.from("opportunity_submissions").select("id, status, opportunities(company_name)").eq("merchant_id", merchant.id),
    ]);
    const next: WorkItem[] = [
      ...(listings || []).map((row) => ({ id: "l" + row.id, title: row.title, detail: "Marketplace listing", status: row.status, href: "/dashboard/listings" })),
      ...(inquiries || []).map((row) => ({ id: "i" + row.id, title: row.subject, detail: "Corporate buyer inquiry", status: row.status, href: "/dashboard/connections" })),
      ...(submissions || []).map((row: any) => ({ id: "s" + row.id, title: (Array.isArray(row.opportunities) ? row.opportunities[0]?.company_name : row.opportunities?.company_name) || "Opportunity", detail: "Opportunity submission", status: row.status, href: "/dashboard/opportunities" })),
    ];
    setItems(next);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const columns = [["To do", ["draft", "sent", "ready"]], ["In progress", ["pending_review", "viewed", "researching", "under_review", "waiting"]], ["Complete", ["published", "accepted", "submitted", "closed"]]] as const;
  return <div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Team-ready workflow</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Coordinate every opportunity</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Listings, buyer requests, and submissions in one shared view.</p>
    <div className="mt-8 grid gap-5 lg:grid-cols-3">{columns.map(([label, statuses]) => { const filtered = items.filter((item) => (statuses as readonly string[]).includes(item.status)); return <section key={label} className="rounded-2xl bg-slate-100 p-4"><div className="flex items-center justify-between px-1"><h2 className="text-sm font-bold text-slate-700">{label}</h2><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500">{filtered.length}</span></div><div className="mt-4 space-y-3">{filtered.map((item) => <Link key={item.id} href={item.href} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200"><p className="font-bold text-slate-950">{item.title}</p><p className="mt-2 text-xs text-slate-500">{item.detail}</p><span className="mt-3 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase text-indigo-700">{item.status.replace("_", " ")}</span></Link>)}{!loading && !filtered.length && <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-400">No items</p>}</div></section>; })}</div>
  </div>;
}
