"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
type Finding = { id: string; title?: string; check_name?: string; recommendation: string | null; severity: string | null; status?: string; result?: string };

export default function BrandReadinessPage() {
  const [score, setScore] = useState<number | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setLoading(false);
    const { data: merchant } = await supabase.from("merchant_profiles").select("id").eq("profile_id", auth.user.id).single();
    if (!merchant) return setLoading(false);
    const { data: stores } = await supabase.from("stores").select("id").eq("merchant_id", merchant.id);
    const storeIds = (stores || []).map((store) => store.id);
    if (!storeIds.length) return setLoading(false);
    const { data: audit } = await supabase.from("audits").select("id, overall_score").in("store_id", storeIds).eq("status", "approved").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!audit) return setLoading(false);
    setScore(Number(audit.overall_score));
    const { data: sections } = await supabase.from("audit_sections").select("id").eq("audit_id", audit.id);
    const sectionIds = (sections || []).map((section) => section.id);
    if (sectionIds.length) {
      const { data } = await supabase.from("audit_findings").select("id, title, check_name, recommendation, severity, status, result").in("section_id", sectionIds).limit(8);
      setFindings((data || []) as Finding[]);
    }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const readiness = score ?? 0;
  return <div className="mx-auto max-w-6xl">
    <div className="rounded-3xl bg-[linear-gradient(120deg,#312e81,#4f46e5_60%,#f97316)] p-7 text-white sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100">Commercial profile</p><div className="mt-3 flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><h1 className="text-3xl font-bold sm:text-4xl">Brand Readiness</h1><p className="mt-3 max-w-2xl text-indigo-100">Understand how ready your store is for corporate buyers and focus your team on the improvements that matter.</p></div><div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[9px] border-white/35 bg-white/10 text-3xl font-bold">{score === null ? "—" : Math.round(readiness)}</div></div></div>
    {loading ? <p className="mt-8 text-sm text-slate-500">Loading your readiness data…</p> : score === null ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="text-xl font-bold text-slate-950">Your readiness score is coming</h2><p className="mt-2 text-sm text-slate-500">Complete your store profile and request an audit to unlock a verified score.</p><Link href="/dashboard/audit" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">Open store audit</Link></div> :
    <><div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="Buyer confidence" value={readiness >= 80 ? "Strong" : readiness >= 60 ? "Developing" : "Needs work"} /><Metric label="Priority actions" value={String(findings.filter((item) => ["high", "critical"].includes(item.severity || "")).length)} /><Metric label="Review status" value="Human verified" /></div>
    <section className="mt-10"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Action plan</p><h2 className="mt-2 text-2xl font-bold text-slate-950">What to improve next</h2></div><Link href="/dashboard/recommendations" className="text-sm font-bold text-indigo-600">All recommendations →</Link></div><div className="mt-5 grid gap-4 md:grid-cols-2">{findings.map((item, index) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex justify-between gap-4"><span className="font-mono text-xs font-bold text-indigo-600">0{index + 1}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold capitalize text-slate-600">{item.severity || "review"}</span></div><h3 className="mt-5 font-bold text-slate-950">{item.title || item.check_name || "Store improvement"}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.recommendation || "Review this area with your GiftGrid audit specialist."}</p></article>)}</div></section></>}
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-xl font-bold text-slate-950">{value}</p></div>; }
