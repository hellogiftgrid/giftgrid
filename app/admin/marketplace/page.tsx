import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/admin/require-super-admin";
import AIListingReview from "@/components/admin/AIListingReview";
import MarketplaceBulkActions from "@/components/admin/MarketplaceBulkActions";
import { approveAllListings, deleteAllListings, reviewListing } from "./actions";

export const metadata = { title: "Buyer Marketplace — GiftGrid Admin" };

async function reviewBuyer(formData: FormData) {
  "use server";
  const admin = await requireSuperAdmin();
  const supabase = await createClient();
  const buyerId = String(formData.get("buyerId") || "");
  const status = String(formData.get("status") || "");
  if (!/^[0-9a-f-]{36}$/i.test(buyerId) || !["approved", "rejected"].includes(status)) throw new Error("Invalid buyer review.");
  const reviewedAt = new Date().toISOString();
  const { error } = await supabase.from("buyer_profiles").update({ status }).eq("id", buyerId);
  if (error) throw new Error(error.message);
  const { error: applicationError } = await supabase.from("buyer_applications").update({ status, reviewed_by: admin.userId, reviewed_at: reviewedAt }).eq("buyer_id", buyerId);
  if (applicationError) throw new Error(applicationError.message);
  revalidatePath("/admin/marketplace");
  revalidatePath("/dashboard");
}

export default async function MarketplaceAdminPage() {
  const supabase = await createClient();
  const [{ data: buyers, error: buyerError }, { data: listings, error: listingError }, { data: inquiries }] = await Promise.all([
    supabase.from("buyer_profiles").select("id, company_name, website, job_title, company_size, annual_gifting_budget, status, created_at, buyer_applications(use_case, estimated_recipients, desired_timeline, requirements)").order("created_at", { ascending: false }),
    supabase.from("merchant_listings").select("id, title, short_description, description, hero_image_url, category, status, minimum_order_quantity, price_range, created_at, merchant_profiles(business_name)").order("created_at", { ascending: false }),
    supabase.from("buyer_inquiries").select("id, subject, message, quantity, budget, status, created_at, buyer_profiles(company_name), merchant_profiles(business_name)").order("created_at", { ascending: false }).limit(100),
  ]);

  return <div className="mx-auto max-w-7xl">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Two-sided marketplace</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Buyer marketplace</h1><p className="mt-2 text-sm text-slate-500">Review buyer access, inspect products, make publication decisions, and oversee buyer requests.</p>
    <div className="mt-7 grid gap-4 sm:grid-cols-3"><Stat label="Buyer applications" value={buyers?.length || 0} /><Stat label="Merchant listings" value={listings?.length || 0} /><Stat label="Buyer requests" value={inquiries?.length || 0} /></div>

    <section className="mt-10"><h2 className="text-xl font-bold text-slate-950">Corporate buyer applications</h2>
      {(buyerError || listingError) && <p className="mt-4 rounded-xl bg-orange-50 p-4 text-sm text-orange-800">The marketplace migration must be applied before this workspace can load live data.</p>}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">{buyers?.map((buyer) => { const application = Array.isArray(buyer.buyer_applications) ? buyer.buyer_applications[0] : buyer.buyer_applications; return <article key={buyer.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex justify-between gap-3"><div><h3 className="text-lg font-bold text-slate-950">{buyer.company_name}</h3><p className="mt-1 text-sm text-slate-500">{buyer.job_title || "Corporate buyer"} · {buyer.company_size || "Size not provided"}</p></div><span className="h-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold capitalize text-indigo-700">{buyer.status}</span></div>{application?.requirements && <p className="mt-4 text-sm leading-6 text-slate-600">{application.requirements}</p>}<div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">{application?.use_case && <span className="rounded-full bg-slate-100 px-3 py-1.5">{application.use_case}</span>}{buyer.annual_gifting_budget && <span className="rounded-full bg-slate-100 px-3 py-1.5">{buyer.annual_gifting_budget}</span>}</div><div className="mt-5 flex gap-2"><ReviewButton action={reviewBuyer} idName="buyerId" id={buyer.id} status="approved" label="Approve" primary /><ReviewButton action={reviewBuyer} idName="buyerId" id={buyer.id} status="rejected" label="Reject" /></div></article>; })}</div>
    </section>

    <section className="mt-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-950">Merchant product review</h2><p className="mt-2 text-sm text-slate-500">Review the full listing and image. Run the AI assistant for a second opinion, then approve or reject it.</p></div><MarketplaceBulkActions approveAll={approveAllListings} deleteAll={deleteAllListings} /></div><div className="mt-5 space-y-4">{listings?.map((listing) => { const merchant = Array.isArray(listing.merchant_profiles) ? listing.merchant_profiles[0] : listing.merchant_profiles; return <article key={listing.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4 flex h-52 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 sm:w-72">{listing.hero_image_url ? <img src={listing.hero_image_url} alt={listing.title} className="h-full w-full object-contain" /> : <span className="text-sm font-semibold text-slate-400">Product image required</span>}</div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="min-w-0"><p className="font-bold text-slate-950">{listing.title}</p><p className="mt-1 text-sm text-slate-500">{merchant?.business_name} · {listing.category} · MOQ {listing.minimum_order_quantity} · {listing.price_range || "Price not supplied"}</p><p className="mt-3 text-sm text-slate-700">{listing.short_description}</p>{listing.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{listing.description}</p>}<p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Status: {listing.status.replaceAll("_", " ")}</p></div><div className="flex shrink-0 gap-2"><ReviewButton action={reviewListing} idName="listingId" id={listing.id} status="published" label={listing.status === "published" ? "Keep published" : "Approve & publish"} primary disabled={!listing.hero_image_url} /><ReviewButton action={reviewListing} idName="listingId" id={listing.id} status="rejected" label="Reject & delete" /></div></div><AIListingReview listingId={listing.id} /></article>; })}{!listings?.length && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No listings submitted.</p>}</div></section>

    <section className="mt-12"><h2 className="text-xl font-bold text-slate-950">Buyer requests oversight</h2><div className="mt-5 space-y-3">{inquiries?.map((inquiry) => { const buyer = Array.isArray(inquiry.buyer_profiles) ? inquiry.buyer_profiles[0] : inquiry.buyer_profiles; const merchant = Array.isArray(inquiry.merchant_profiles) ? inquiry.merchant_profiles[0] : inquiry.merchant_profiles; return <article key={inquiry.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold text-slate-950">{inquiry.subject}</h3><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">{inquiry.status}</span></div><p className="mt-2 text-sm text-slate-600">From {buyer?.company_name || "Buyer"} to {merchant?.business_name || "Merchant"}{inquiry.quantity ? ` · Quantity ${inquiry.quantity}` : ""}{inquiry.budget ? ` · ${inquiry.budget}` : ""}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{inquiry.message}</p></article>; })}{!inquiries?.length && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No buyer requests yet.</p>}</div></section>
  </div>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p></div>; }
function ReviewButton({ action, idName, id, status, label, primary = false, disabled = false }: { action: (data: FormData) => Promise<void>; idName: string; id: string; status: string; label: string; primary?: boolean; disabled?: boolean }) { return <form action={action}><input type="hidden" name={idName} value={id} /><input type="hidden" name="status" value={status} /><button disabled={disabled} title={disabled ? "Add a product image before approving" : undefined} className={primary ? "rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40" : "rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"}>{label}</button></form>; }
