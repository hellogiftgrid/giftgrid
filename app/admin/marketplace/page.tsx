import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Buyer Marketplace — GiftGrid Admin" };

async function reviewBuyer(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const buyerId = String(formData.get("buyerId") || "");
  const status = String(formData.get("status") || "");
  await supabase.from("buyer_profiles").update({ status }).eq("id", buyerId);
  await supabase.from("buyer_applications").update({ status, reviewed_at: new Date().toISOString() }).eq("buyer_id", buyerId);
  revalidatePath("/admin/marketplace");
}

async function reviewListing(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("merchant_listings").update({ status: String(formData.get("status") || "") }).eq("id", String(formData.get("listingId") || ""));
  revalidatePath("/admin/marketplace");
  revalidatePath("/buyer/dashboard");
}

export default async function MarketplaceAdminPage() {
  const supabase = await createClient();
  const [{ data: buyers, error: buyerError }, { data: listings, error: listingError }, { data: inquiries }] = await Promise.all([
    supabase.from("buyer_profiles").select("id, company_name, website, job_title, company_size, annual_gifting_budget, status, created_at, buyer_applications(use_case, estimated_recipients, desired_timeline, requirements)").order("created_at", { ascending: false }),
    supabase.from("merchant_listings").select("id, title, category, status, created_at, merchant_profiles(business_name)").order("created_at", { ascending: false }),
    supabase.from("buyer_inquiries").select("id, status"),
  ]);

  return <div className="mx-auto max-w-7xl">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Two-sided marketplace</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Buyer marketplace</h1><p className="mt-2 text-sm text-slate-500">Approve corporate buyers, publish merchant listings, and oversee connections.</p>
    <div className="mt-7 grid gap-4 sm:grid-cols-3"><Stat label="Buyer applications" value={buyers?.length || 0} /><Stat label="Merchant listings" value={listings?.length || 0} /><Stat label="Connections" value={inquiries?.length || 0} /></div>

    <section className="mt-10"><h2 className="text-xl font-bold text-slate-950">Corporate buyer applications</h2>
      {(buyerError || listingError) && <p className="mt-4 rounded-xl bg-orange-50 p-4 text-sm text-orange-800">The marketplace migration must be applied before this workspace can load live data.</p>}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">{buyers?.map((buyer) => { const application = Array.isArray(buyer.buyer_applications) ? buyer.buyer_applications[0] : buyer.buyer_applications; return <article key={buyer.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex justify-between gap-3"><div><h3 className="text-lg font-bold text-slate-950">{buyer.company_name}</h3><p className="mt-1 text-sm text-slate-500">{buyer.job_title || "Corporate buyer"} · {buyer.company_size || "Size not provided"}</p></div><span className="h-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold capitalize text-indigo-700">{buyer.status}</span></div>{application?.requirements && <p className="mt-4 text-sm leading-6 text-slate-600">{application.requirements}</p>}<div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">{application?.use_case && <span className="rounded-full bg-slate-100 px-3 py-1.5">{application.use_case}</span>}{buyer.annual_gifting_budget && <span className="rounded-full bg-slate-100 px-3 py-1.5">{buyer.annual_gifting_budget}</span>}</div><div className="mt-5 flex gap-2"><ReviewButton action={reviewBuyer} idName="buyerId" id={buyer.id} status="approved" label="Approve" primary /><ReviewButton action={reviewBuyer} idName="buyerId" id={buyer.id} status="rejected" label="Reject" /></div></article>; })}</div>
    </section>

    <section className="mt-12"><h2 className="text-xl font-bold text-slate-950">Merchant listing review</h2><div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">{listings?.map((listing) => { const merchant = Array.isArray(listing.merchant_profiles) ? listing.merchant_profiles[0] : listing.merchant_profiles; return <div key={listing.id} className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 last:border-0 sm:flex-row sm:items-center"><div><p className="font-bold text-slate-950">{listing.title}</p><p className="mt-1 text-sm text-slate-500">{merchant?.business_name} · {listing.category} · <span className="capitalize">{listing.status.replace("_", " ")}</span></p></div><div className="flex gap-2"><ReviewButton action={reviewListing} idName="listingId" id={listing.id} status="published" label="Publish" primary /><ReviewButton action={reviewListing} idName="listingId" id={listing.id} status="rejected" label="Reject" /></div></div>; })}{!listings?.length && <p className="p-8 text-center text-sm text-slate-500">No listings submitted.</p>}</div></section>
  </div>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p></div>; }
function ReviewButton({ action, idName, id, status, label, primary = false }: { action: (data: FormData) => Promise<void>; idName: string; id: string; status: string; label: string; primary?: boolean }) { return <form action={action}><input type="hidden" name={idName} value={id} /><input type="hidden" name="status" value={status} /><button className={primary ? "rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white" : "rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"}>{label}</button></form>; }
