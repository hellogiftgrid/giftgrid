"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/require-super-admin";

function refreshMarketplace() {
  revalidatePath("/admin/marketplace");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath("/market");
}

export async function reviewListing(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("listingId") || "");
  const status = String(formData.get("status") || "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["published", "rejected"].includes(status)) throw new Error("Invalid listing review.");

  const admin = createAdminClient();
  if (status === "rejected") {
    const { error } = await admin.from("merchant_listings").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error: readError } = await admin.from("merchant_listings").select("hero_image_url").eq("id", id).maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!data?.hero_image_url?.trim()) throw new Error("Add a product image before publishing this listing.");
    const { error } = await admin.from("merchant_listings").update({ status: "published" }).eq("id", id);
    if (error) throw new Error(error.message);
  }
  refreshMarketplace();
}

export async function approveAllListings() {
  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.from("merchant_listings").update({ status: "published" }).eq("status", "pending_review").not("hero_image_url", "is", null).neq("hero_image_url", "").select("id");
  if (error) throw new Error(error.message);
  refreshMarketplace();
  return `${data?.length || 0} listings approved. Listings without images remain pending.`;
}

export async function deleteAllListings() {
  await requireSuperAdmin();
  const admin = createAdminClient();
  const ids: string[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin.from("merchant_listings").select("id").order("id").range(from, from + 999);
    if (error) throw new Error(error.message);
    ids.push(...(data || []).map((row) => row.id));
    if (!data || data.length < 1000) break;
  }
  for (let index = 0; index < ids.length; index += 500) {
    const { error } = await admin.from("merchant_listings").delete().in("id", ids.slice(index, index + 500));
    if (error) throw new Error(error.message);
  }
  refreshMarketplace();
  return `${ids.length} listings deleted.`;
}
