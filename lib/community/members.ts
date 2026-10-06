import "server-only";
import { GIFTGRID_ADMIN_AVATAR, isGiftGridAdmin } from "@/config/identity";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/developer/api";

export async function memberContext() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)throw new ApiError(401,"Sign in to use your community account.");
  return {supabase,user,admin:createAdminClient()};
}
export async function memberDirectory() {
  const admin = createAdminClient();
  const result: {profile_id:string;display_name:string;kind:string;bio:string|null;country:string|null;avatar_url:string|null;store_url:string|null;product:{title:string;short_description:string;hero_image_url:string|null;price_range:string|null;minimum_order_quantity:number}|null}[] = [];
  for (let offset = 0; ; offset += 1000) {
    // Membership is independent of trade decks, store approval, or profile completion.
    // Inactive accounts remain excluded; every active registered member is listed.
    const accounts = await admin.from("profiles").select("id,full_name,role").eq("is_active",true).order("id").range(offset,offset+999);
    if (accounts.error) throw new ApiError(503,"Unable to load the community directory.");
    if (!accounts.data?.length) break;
    const ids = accounts.data.map(account => account.id);
    const [members,merchants] = await Promise.all([
      admin.from("community_member_profiles").select("profile_id,display_name,bio,country,avatar_url").in("profile_id",ids),
      admin.from("merchant_profiles").select("id,user_id,business_name,business_description,country,avatar_url,store_url").in("user_id",ids),
    ]);
    if (members.error || merchants.error) throw new ApiError(503,"Unable to load member details.");
    const details = new Map((members.data || []).map(member => [member.profile_id,member]));
    const businesses = new Map((merchants.data || []).map(merchant => [merchant.user_id,merchant]));
    const merchantIds = (merchants.data || []).map(merchant => merchant.id);
    const { data: ranking } = await admin.from("merchant_ranking").select("merchant_id,rank");
    const rankByMerchant = new Map((ranking || []).map((row: { merchant_id: string; rank: number }) => [row.merchant_id, row.rank]));
    const { data: products, error: productsError } = merchantIds.length
      ? await admin.from("merchant_listings").select("merchant_id,title,short_description,hero_image_url,price_range,minimum_order_quantity").in("merchant_id", merchantIds).eq("status", "published").order("created_at", { ascending: false }).limit(1000)
      : { data: [], error: null };
    if (productsError) throw new ApiError(503,"Unable to load merchant products.");
    const featuredProducts = new Map<string,NonNullable<typeof products>[number]>();
    for (const product of products || []) if (!featuredProducts.has(product.merchant_id)) featuredProducts.set(product.merchant_id,product);
    for (const account of accounts.data) {
      const member = details.get(account.id), business = account.role === "merchant" ? businesses.get(account.id) : undefined;
      const name = member?.display_name || account.full_name || business?.business_name || "GiftGrid member";
      const storeUrl = safeStoreUrl(business?.store_url);
      result.push({profile_id:account.id,display_name:name.includes("@") ? "GiftGrid member" : name,kind:isGiftGridAdmin(account.role) ? "admin" : account.role === "merchant" ? "merchant" : "buyer",bio:member?.bio || business?.business_description || null,country:member?.country || business?.country || null,avatar_url:isGiftGridAdmin(account.role) ? GIFTGRID_ADMIN_AVATAR : member?.avatar_url || business?.avatar_url || null,store_url:storeUrl,product:business ? featuredProducts.get(business.id) || null : null,merchant_id: business?.id || null,rank: business ? rankByMerchant.get(business.id) ?? null : null} as never);
    }
    if (accounts.data.length < 1000) break;
  }
  return result.sort((a, b) => { const ra = (a as { rank?: number | null }).rank ?? 1e9; const rb = (b as { rank?: number | null }).rank ?? 1e9; return ra - rb || a.display_name.localeCompare(b.display_name); });
}

function safeStoreUrl(value: string | null | undefined) {
  if (!value) return null;
  try { const url = new URL(value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`); return ["https:","http:"].includes(url.protocol) ? url.toString() : null; }
  catch { return null; }
}
export async function ownedCommunityImage(path:unknown,userId:string) {
  if(typeof path!=="string" || !new RegExp(`^${userId}/[0-9a-f-]{36}\\.(jpg|png|webp)$`,"i").test(path))throw new ApiError(400,"Upload your own image first.");
  const storage=createAdminClient().storage.from("community-media");
  const {data,error}=await storage.info(path);
  if(error || !data)throw new ApiError(400,"The uploaded image was not found.");
  return storage.getPublicUrl(path).data.publicUrl;
}
