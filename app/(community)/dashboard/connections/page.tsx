"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BuyerRequestBoard from "@/components/public/BuyerRequestBoard";

const supabase = createClient();
type Inquiry = { id: string; subject: string; message: string; quantity: number | null; target_date: string | null; budget: string | null; status: string; created_at: string; buyer_profiles: { company_name: string } | { company_name: string }[] | null };

export default function MerchantConnectionsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data: merchant } = await supabase.from("merchant_profiles").select("id").eq("user_id", auth.user.id).single();
    if (!merchant) return;
    const { data } = await supabase.from("buyer_inquiries").select("id, subject, message, quantity, target_date, budget, status, created_at, buyer_profiles(company_name)").eq("merchant_id", merchant.id).not("subject", "like", "[GGREQ:%").order("created_at", { ascending: false });
    setInquiries((data || []) as Inquiry[]);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function setStatus(id: string, status: "accepted" | "declined") {
    await supabase.from("buyer_inquiries").update({ status }).eq("id", id);
    await load();
  }

  return <div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Corporate buyers</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Buyer connections</h1><section className="mt-6"><BuyerRequestBoard /></section><p className="mt-2 text-sm text-slate-500">Review genuine sourcing requests and decide who you want to work with.</p>
    <div className="mt-8 grid gap-5">{inquiries.map((inquiry) => { const buyer = Array.isArray(inquiry.buyer_profiles) ? inquiry.buyer_profiles[0] : inquiry.buyer_profiles; return <article key={inquiry.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{buyer?.company_name || "Corporate buyer"}</p><h2 className="mt-2 text-xl font-bold text-slate-950">{inquiry.subject}</h2></div><span className="h-fit w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold capitalize text-indigo-700">{inquiry.status}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{inquiry.message}</p><div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">{inquiry.quantity && <span className="rounded-full bg-slate-100 px-3 py-2">Quantity: {inquiry.quantity}</span>}{inquiry.budget && <span className="rounded-full bg-slate-100 px-3 py-2">Budget: {inquiry.budget}</span>}{inquiry.target_date && <span className="rounded-full bg-slate-100 px-3 py-2">Needed: {inquiry.target_date}</span>}</div>{["sent", "viewed"].includes(inquiry.status) && <div className="mt-6 flex gap-3"><button onClick={() => setStatus(inquiry.id, "accepted")} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white">Accept connection</button><button onClick={() => setStatus(inquiry.id, "declined")} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Decline</button></div>}</article>; })}{!loading && !inquiries.length && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">New buyer inquiries will appear here.</div>}</div>
  </div>;
}
