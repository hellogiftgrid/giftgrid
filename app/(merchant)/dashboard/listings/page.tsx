"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { opportunityCategories } from "@/config/branding";

const supabase = createClient();
type Listing = { id: string; title: string; category: string; status: string; minimum_order_quantity: number; price_range: string | null; short_description: string };

export default function MerchantListingsPage() {
  const [merchantId, setMerchantId] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data: merchant } = await supabase.from("merchant_profiles").select("id").eq("profile_id", auth.user.id).single();
    if (!merchant) return;
    setMerchantId(merchant.id);
    const { data } = await supabase.from("merchant_listings").select("id, title, category, status, minimum_order_quantity, price_range, short_description").eq("merchant_id", merchant.id).order("created_at", { ascending: false });
    setListings(data || []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function createListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from("merchant_listings").insert({
      merchant_id: merchantId,
      title: String(form.get("title") || ""),
      short_description: String(form.get("shortDescription") || ""),
      description: String(form.get("description") || ""),
      hero_image_url: String(form.get("imageUrl") || "") || null,
      category: String(form.get("category") || ""),
      minimum_order_quantity: Number(form.get("minimumOrder")) || 1,
      price_range: String(form.get("priceRange") || ""),
      lead_time: String(form.get("leadTime") || ""),
      ships_internationally: form.get("international") === "on",
      customization_available: form.get("customization") === "on",
      status: "pending_review",
    });
    if (error) return setNotice(error.message);
    setNotice("Listing submitted for admin review.");
    setShowForm(false);
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Buyer marketplace</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Product listings</h1><p className="mt-2 text-sm text-slate-500">Show corporate buyers what your brand can supply.</p></div>
        <button onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">{showForm ? "Close form" : "+ Create listing"}</button>
      </div>
      {notice && <p className="mt-6 rounded-xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-800">{notice}</p>}

      {showForm && <form onSubmit={createListing} className="mt-7 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <Field name="title" label="Listing title" required />
        <label><span className="mb-2 block text-sm font-bold">Category</span><select name="category" required className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"><option value="">Select category</option>{opportunityCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <Field name="shortDescription" label="Short description" required className="sm:col-span-2" />
        <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Full description</span><textarea name="description" rows={4} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" /></label>
        <Field name="minimumOrder" label="Minimum order quantity" type="number" min={1} required />
        <Field name="priceRange" label="Price range" placeholder="$25–$60 per item" />
        <Field name="leadTime" label="Typical lead time" placeholder="2–3 weeks" />
        <Field name="imageUrl" label="Product image URL" type="url" />
        <div className="flex flex-wrap gap-5 sm:col-span-2"><label className="flex items-center gap-2 text-sm font-semibold"><input name="customization" type="checkbox" className="accent-indigo-600" /> Customization available</label><label className="flex items-center gap-2 text-sm font-semibold"><input name="international" type="checkbox" className="accent-indigo-600" /> Ships internationally</label></div>
        <button disabled={!merchantId} className="rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white disabled:opacity-40 sm:col-span-2">Submit for review</button>
      </form>}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {listings.map((listing) => <article key={listing.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{listing.category}</p><h2 className="mt-2 text-xl font-bold text-slate-950">{listing.title}</h2></div><span className={"rounded-full px-3 py-1 text-xs font-bold capitalize " + (listing.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700")}>{listing.status.replace("_", " ")}</span></div><p className="mt-4 text-sm leading-6 text-slate-600">{listing.short_description}</p><div className="mt-4 flex gap-2 text-xs font-semibold text-slate-500"><span className="rounded-full bg-slate-100 px-3 py-1.5">MOQ {listing.minimum_order_quantity}</span>{listing.price_range && <span className="rounded-full bg-slate-100 px-3 py-1.5">{listing.price_range}</span>}</div></article>)}
        {!listings.length && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 md:col-span-2">Create your first listing to appear in the corporate buyer catalog.</div>}
      </div>
    </div>
  );
}

function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={className}><span className="mb-2 block text-sm font-bold">{label}</span><input {...props} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100" /></label>;
}
