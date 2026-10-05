"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerRequestBoard from "@/components/public/BuyerRequestBoard";

type Buyer = { id: string; company_name: string; status: string; job_title: string | null; phone: string | null; website: string | null; full_name: string | null; profile_complete: boolean };
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
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/buyer/dashboard", { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) {
        router.replace("/auth/sign-in?next=%2Fbuyer%2Fdashboard");
        return;
      }
      if (response.status === 404) {
        router.replace("/buyers/apply");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Unable to load your buyer dashboard.");
      setBuyer(result.buyer as Buyer);
      const nextListings = (result.listings || []) as Listing[];
      setListings(nextListings);
      const requestedListing = new URLSearchParams(window.location.search).get("listing");
      if (requestedListing) setSelected(nextListings.find((item) => item.id === requestedListing) || null);
      setInquiries((result.inquiries || []) as Inquiry[]);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load your buyer dashboard.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { const timer = setTimeout(() => { void load(); }, 0); return () => clearTimeout(timer); }, [load]);

  async function sendInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!buyer || !selected || sendingInquiry) return;
    if (buyer.status !== "approved") {
      setInquiryMessage("Your buyer account must be approved before sending an inquiry.");
      return;
    }
    if (!buyer.profile_complete) {
      setInquiryMessage("Complete and review your buyer profile before sending an inquiry.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const amount = String(form.get("budget") || "").trim();
    const currency = String(form.get("budgetCurrency") || "USD");
    if (amount && (!Number.isFinite(Number(amount)) || Number(amount) <= 0)) {
      setInquiryMessage("Enter a budget amount greater than zero, or leave it blank.");
      return;
    }
    const budget = amount ? `${currency} ${Number(amount).toFixed(2)}` : "";
    setSendingInquiry(true);
    setInquiryMessage("");
    try {
      const response = await fetch("/api/buyer/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selected.id,
          subject: String(form.get("subject") || ""),
          message: String(form.get("message") || ""),
          quantity: String(form.get("quantity") || ""),
          targetDate: String(form.get("targetDate") || ""),
          budget,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your inquiry.");
      setSelected(null);
      setMessage("Inquiry sent. The merchant can now respond from their dashboard.");
      await load();
    } catch (error) {
      setInquiryMessage(error instanceof Error ? error.message : "Unable to send your inquiry. Please try again.");
    } finally {
      setSendingInquiry(false);
    }
  }

  async function saveBuyerProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingProfile) return;
    setSavingProfile(true);
    setProfileMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/buyer/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: form.get("fullName"), companyName: form.get("companyName"), jobTitle: form.get("jobTitle"), phone: form.get("phone"), website: form.get("website") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save your buyer profile.");
      setProfileMessage("Profile saved. Review your details below before contacting a merchant.");
      setEditingProfile(false);
      await load();
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Unable to save your buyer profile.");
    } finally { setSavingProfile(false); }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500">Loading buyer workspace…</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="rounded-3xl bg-[linear-gradient(120deg,#312e81,#4f46e5_60%,#f97316)] p-7 text-white sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100">Gifting workspace</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Find the right brand for every moment.</h1><p className="mt-3 max-w-2xl text-indigo-100">Browse reviewed merchants and start a direct conversation about your gifting program.</p></div>
            <span className={"w-fit rounded-full px-4 py-2 text-xs font-bold " + (buyer?.status === "approved" ? "bg-emerald-400/20 text-emerald-50" : "bg-orange-300/20 text-orange-50")}>{buyer?.status === "approved" ? "Approved gifting team" : "Request " + buyer?.status}</span>
          </div>
        </div>

        {buyer && buyer.status !== "approved" && <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-900"><strong>Your application is being reviewed.</strong> You can explore the catalog now; connections unlock after approval.</div>}
        {buyer && <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" id="buyer-profile">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Buyer profile</p><h2 className="mt-1 text-xl font-bold text-slate-950">{buyer.profile_complete ? "Review your details before making an inquiry" : "Complete your profile to contact merchants"}</h2><p className="mt-2 text-sm text-slate-600">Your name, company, role and contact number are required. You can edit them here at any time.</p></div>{buyer.profile_complete && <div className="flex items-center gap-3"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Profile complete</span><button type="button" onClick={() => setEditingProfile((value) => !value)} className="text-sm font-bold text-indigo-700 underline">{editingProfile ? "Cancel edit" : "Edit profile"}</button></div>}</div>
          {buyer.profile_complete && !editingProfile ? <dl className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Name</dt><dd className="font-semibold text-slate-900">{buyer.full_name}</dd></div><div><dt className="text-slate-500">Company</dt><dd className="font-semibold text-slate-900">{buyer.company_name}</dd></div><div><dt className="text-slate-500">Job title</dt><dd className="font-semibold text-slate-900">{buyer.job_title}</dd></div><div><dt className="text-slate-500">Phone</dt><dd className="font-semibold text-slate-900">{buyer.phone}</dd></div>{buyer.website && <div><dt className="text-slate-500">Website</dt><dd className="font-semibold text-slate-900">{buyer.website}</dd></div>}</dl> : <form onSubmit={saveBuyerProfile} className="mt-5 grid gap-4 sm:grid-cols-2"><Input name="fullName" label="Full name" required minLength={2} defaultValue={buyer.full_name || ""} /><Input name="companyName" label="Company name" required minLength={2} defaultValue={buyer.company_name || ""} /><Input name="jobTitle" label="Job title" required minLength={2} defaultValue={buyer.job_title || ""} /><Input name="phone" label="Contact phone" required minLength={7} defaultValue={buyer.phone || ""} /><Input name="website" label="Company website (optional)" type="url" defaultValue={buyer.website || ""} /><button disabled={savingProfile} className="self-end rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{savingProfile ? "Saving…" : "Save buyer profile"}</button></form>}
          {profileMessage && <p role="status" className="mt-4 text-sm font-semibold text-indigo-700">{profileMessage}</p>}
        </section>}
        {loadError && <div role="alert" className="mt-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><span>{loadError}</span><button type="button" onClick={() => void load()} className="w-fit rounded-lg border border-rose-300 px-4 py-2 font-bold">Try again</button></div>}
        {message && <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold text-indigo-800">{message}</div>}

        <section className="mt-8"><BuyerRequestBoard buyerDashboard /></section>
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Merchant catalog</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Brands ready for business</h2></div><span className="text-sm text-slate-500">{listings.length} listings</span></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const merchant = Array.isArray(listing.merchant_profiles) ? listing.merchant_profiles[0] : listing.merchant_profiles;
              return <article key={listing.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-orange-100">{listing.hero_image_url ? <Image src={listing.hero_image_url} alt={listing.title} fill sizes="400px" unoptimized className="object-cover" /> : <div className="flex h-full items-center justify-center text-4xl font-bold text-indigo-300">{listing.title.charAt(0)}</div>}</div>
                <div className="p-5"><div className="flex items-center gap-2">{merchant?.avatar_url ? <Image src={merchant.avatar_url} alt={merchant.business_name} width={32} height={32} unoptimized className="size-8 rounded-full object-cover" /> : <span className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{(merchant?.business_name || "M").slice(0, 1)}</span>}<p className="text-sm font-semibold text-slate-500">{merchant?.business_name}</p></div><p className="mt-4 text-xs font-bold uppercase tracking-wider text-indigo-600">{listing.category}</p><h3 className="mt-2 text-xl font-bold text-slate-950">{listing.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{listing.short_description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600"><span className="rounded-full bg-slate-100 px-3 py-1.5">MOQ {listing.minimum_order_quantity}</span><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">{listing.price_range || "Price on request"}</span>{listing.customization_available && <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-700">Customizable</span>}</div>
                  <button type="button" disabled={buyer?.status !== "approved" || !buyer?.profile_complete} onClick={() => { setInquiryMessage(""); setSelected(listing); }} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">{buyer?.status !== "approved" ? "Approval required" : !buyer?.profile_complete ? "Complete profile to inquire" : "Send inquiry"}</button>
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

      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">New inquiry</p><h2 className="mt-2 text-2xl font-bold text-slate-950">{selected.title}</h2></div><button type="button" onClick={() => setSelected(null)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold">Close</button></div>
        {inquiryMessage && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{inquiryMessage}</p>}
        <form onSubmit={sendInquiry} className="mt-6 grid gap-4 sm:grid-cols-2"><Input name="subject" label="Subject" required maxLength={160} className="sm:col-span-2" /><Input name="quantity" label="Estimated quantity" type="number" min={1} max={100000000} step={1} /><Input name="targetDate" label="Target date" type="date" /><label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Budget amount</span><span className="flex gap-2"><select name="budgetCurrency" defaultValue="USD" aria-label="Budget currency" className="rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"><option>USD</option><option>CAD</option><option>GBP</option><option>EUR</option></select><input name="budget" type="number" min="0.01" max="999999999.99" step="0.01" inputMode="decimal" placeholder="Amount (optional)" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100" /></span><span className="mt-1 block text-xs text-slate-500">Enter a per-gift or total program budget; explain which in your message.</span></label><label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Tell the merchant about your program</span><textarea name="message" rows={5} maxLength={4000} required className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100" /></label><button disabled={sendingInquiry} className="rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">{sendingInquiry ? "Sending inquiry…" : "Send inquiry"}</button></form>
      </div></div>}
    </div>
  );
}

function Input({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={className}><span className="mb-2 block text-sm font-bold">{label}</span><input {...props} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100" /></label>;
}
