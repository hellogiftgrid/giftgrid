import "server-only";
import { GIFTGRID_ADMIN_AVATAR, isGiftGridAdmin } from "@/config/identity";
import { createAdminClient } from "@/lib/supabase/admin";
import { uuid } from "@/lib/developer/api";

// Explicit projection: account email, phone, private notes and file paths are never public.
export async function getPublicMember(id: string) {
  if (!uuid(id)) return null;
  const admin = createAdminClient();
  const [member, merchant, account] = await Promise.all([
    admin.from("community_member_profiles").select("display_name,kind,bio,country,avatar_url").eq("profile_id", id).maybeSingle(),
    admin.from("merchant_profiles").select("id,business_name,business_description,country,avatar_url,business_category,application_status,store_url").eq("user_id", id).maybeSingle(),
    admin.from("profiles").select("full_name,role").eq("id", id).eq("is_active", true).maybeSingle(),
  ]);
  if (member.error || merchant.error || account.error) throw new Error("Unable to load this member profile.");
  if (!account.data) return null;
  const business = account.data.role === "merchant" ? merchant.data : null;
  const name = member.data?.display_name || account.data.full_name || business?.business_name || "GiftGrid member";
  const { data: products, error: productsError } = business
    ? await admin.from("merchant_listings").select("id,title,short_description,hero_image_url,price_range,minimum_order_quantity").eq("merchant_id", business.id).eq("status", "published").order("created_at", { ascending: false }).limit(12)
    : { data: [], error: null };
  if (productsError) throw new Error("Unable to load merchant products.");
  return {
    id, name: name.includes("@") ? "GiftGrid member" : name,
    kind: isGiftGridAdmin(account.data.role) ? "admin" : account.data.role === "merchant" ? "merchant" : "buyer",
    bio: member.data?.bio || business?.business_description,
    country: member.data?.country || business?.country,
    avatar: isGiftGridAdmin(account.data.role) ? GIFTGRID_ADMIN_AVATAR : member.data?.avatar_url || business?.avatar_url,
    businessName: business?.business_name, category: business?.business_category,
    storeUrl: safeStoreUrl(business?.store_url), products: products || [],
    approved: business?.application_status === "approved",
  };
}

function safeStoreUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null;
  } catch { return null; }
}
