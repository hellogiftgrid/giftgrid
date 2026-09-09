"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Buyer = { id: string; company_name: string; status: string };
type Listing = {
  id: string; merchant_id: string; title: string; short_description: string;
  hero_image_url: string | null; category: string; minimum_order_quantity: number;
  price_range: string | null; lead_time: string | null; customization_available: boolean;
  merchant_profiles: { business_name: string; avatar_url: string | null } | { business_name: string; avatar_url: string | null }[] | null;
};
type Inquiry = { id: string; subject: string; status: string; created_at: string; merchant_profiles: { business_name: string } | { business_name: string }[] | null };

export default function BuyerDashboardPage() {
  const router = useRouter();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.replace("/auth/sign-in");
      return;
    }
    const { data: buyerData } = await supabase.from("buyer_profiles").select("id, company_name, status").eq("profile_id", auth.user.id).single();
    if (!buyerData) {
      router.replace("/buyers/apply");
      return;
    }
    setBuyer(buyerData);
    const [{ data: listingData }, { data: inquiryData }] = await Promise.all([
      supabase.from("merchant_listings").select("id, merchant_id, title, short_description, hero_image_url, category, minimum_order_quantity, price_range, lead_time, customization_available, merchant_profiles(business_name,avatar_url)").eq("status", "published").order("featured", { ascending: false }),
      supabase.from("buyer_inquiries").select("id, subject, status, created_at, merchant_profiles(business_name)").eq("buyer_id", buyerData.id).order("created_at", { ascending: false }),
    ]);
    setListings((listingData || []) as Listing[]);
    setInquiries((inquiryData || []) as Inquiry[]);
    setLoading(false);
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  async function sendInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!buyer || !selected) return;
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from("buyer_inquiries").insert({
      buyer_id: buyer.id,
      merchant_id: selected.merchant_id,
      listing_id: selected.id,
      subject: String(form.get("subject") || ""),
      message: String(form.get("message") || ""),
      quantity: Number(form.get("quantity")) || null,
      target_date: String(form.get("targetDate") || "") || null,
      budget: String(form.get("budget") || ""),
    });
    if (error) return setMessage(error.message);
    setSelected(null);
    setMessage("Inquiry sent. The merchant can now respond from their dashboard.");
    await load();
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500">Loading buyer workspace…</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="font-bold text-slate-950">GiftGrid <span className="text-indigo-600">Gifting</span></Link>
          <div className="flex items-center gap-4"><span className="hidden text-sm font-semibold text-slate-600 sm:block">{buyer?.company_name}</span><a href="/auth/sign-out" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Sign out</a></div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="rounded-3xl bg-[linear-gradient(120deg,#312e81,#4f46e5_60%,#f97316)] p-7 text-white sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100">Gifting workspace</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Find the right brand for every moment.</h1><p className="mt-3 max-w-2xl text-indigo-100">Browse reviewed merchants and start a direct conversation about your gifting program.</p></div>
            <span className={"w-fit rounded-full px-4 py-2 text-xs font-bold " + (buyer?.status === "approved" ? "bg-emerald-400/20 text-emerald-50" : "bg-orange-300/20 text-orange-50")}>{buyer?.status === "approved" ? "Approved gifting team" : "Request " + buyer?.status}</span>
          </div>
        </div>

        {buyer?.status !== "approved" && <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-900"><strong>Your application is being reviewed.</strong> You can explore the catalog now; connections unlock after approval.</div>}
        {message && <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold text-indigo-800">{message}</div>}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Merchant catalog</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Brands ready for business</h2></div><span className="text-sm text-slate-500">{listings.length} listings</span></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const merchant = Array.isArray(listing.merchant_profiles) ? listing.merchant_profiles[0] : listing.merchant_profiles;
              return <article key={listing.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-orange-100">{listing.hero_image_url ? <Image src={listing.hero_image_url} alt="" fill sizes="400px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-4xl font-bold text-indigo-300">{listing.title.charAt(0)}</div>}</div>
                <div className="p-5"><div className="flex items-center gap-2">{merchant?.avatar_url ? <Image src={merchant.avatar_url} alt="" width={32} height={32} className="size-8 rounded-full object-cover" /> : <span className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{(merchant?.business_name || "M").slice(0, 1)}</span>}<p className="text-sm font-semibold text-slate-500">{merchant?.business_name}</p></div><p className="mt-4 text-xs font-bold uppercase tracking-wider text-indigo-600">{listing.category}</p><h3 className="mt-2 text-xl font-bold text-slate-950">{listing.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{listing.short_description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600"><span className="rounded-full bg-slate-100 px-3 py-1.5">MOQ {listing.minimum_order_quantity}</span>{listing.price_range && <span className="rounded-full bg-slate-100 px-3 py-1.5">{listing.price_range}</span>}{listing.customization_available && <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-700">Customizable</span>}</div>
                  <button disabled={buyer?.status !== "approved"} onClick={() => setSelected(listing)} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">Connect with merchant</button>
                </div>
              </article>;
            })}
            {!listings.length && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-3">Published merchant listings will appear here.</div>}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-slate-950">Your connections</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {inquiries.map((inquiry) => {
              const merchant = Array.isArray(inquiry.merchant_profiles) ? inquiry.merchant_profiles[0] : inquiry.merchant_profiles;
              return <div key={inquiry.id} className="flex flex-col gap-3 border-b border-slate-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-900">{inquiry.subject}</p><p className="mt-1 text-sm text-slate-500">{merchant?.business_name || "Merchant"} · {new Date(inquiry.created_at).toLocaleDateString()}</p></div><span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold capitalize text-indigo-700">{inquiry.status}</span></div>;
            })}
            {!inquiries.length && <p className="p-8 text-center text-sm text-slate-500">Your merchant conversations will appear here.</p>}
          </div>
        </section>
      </main>

      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">New inquiry</p><h2 className="mt-2 text-2xl font-bold text-slate-950">{selected.title}</h2></div><button onClick={() => setSelected(null)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold">Close</button></div>
        <form onSubmit={sendInquiry} className="mt-6 grid gap-4 sm:grid-cols-2"><Input name="subject" label="Subject" required className="sm:col-span-2" /><Input name="quantity" label="Estimated quantity" type="number" min={1} /><Input name="targetDate" label="Target date" type="date" /><Input name="budget" label="Budget range" className="sm:col-span-2" /><label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Tell the merchant about your program</span><textarea name="message" rows={5} required className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100" /></label><button className="rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white sm:col-span-2">Send inquiry</button></form>
      </div></div>}
    </div>
  );
}

function Input({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={className}><span className="mb-2 block text-sm font-bold">{label}</span><input {...props} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100" /></label>;
}
