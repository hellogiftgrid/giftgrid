import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupplierProducts } from "./suppliers";
import { supplierPage, type SupplierProduct } from "./supplier-schema";

export type ShopProduct = { id: string; title: string; short_description: string; description: string | null; category: string; hero_image_url: string | null; minimum_order_quantity: number | null; price_range: string | null; lead_time: string | null; customization_available: boolean; merchant_profiles: { business_name: string; avatar_url: string | null } | null; supplier?: { source: string; name: string; url: string; checked_at: string; availability: string } };
function supplierProduct(product: SupplierProduct): ShopProduct {
  return {
    id: product.id, title: product.title, short_description: product.description.slice(0, 300), description: product.description,
    category: product.category, hero_image_url: product.image_url, minimum_order_quantity: product.minimum_order_quantity,
    price_range: product.price === null ? null : `${product.currency} ${product.price.toFixed(2)}`,
    lead_time: null, customization_available: false, merchant_profiles: null,
    supplier: { source: product.source === "faire" ? "Faire" : "AliExpress", name: product.supplier_name, url: product.source_url, checked_at: product.checked_at, availability: product.availability },
  };
}
const fields = "id,title,short_description,description,category,hero_image_url,minimum_order_quantity,price_range,lead_time,customization_available,merchant_profiles(business_name,avatar_url)";
export async function getShopCatalog(category = "", page = 1) {
  const admin = createAdminClient();
  let query = admin.from("shop_visible_listings").select(fields, { count: "exact" }).eq("status", "published").order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const offset = (page - 1) * 24;
  const [products, categories] = await Promise.all([query.range(offset, offset + 23), admin.rpc("shop_categories")]);
  if (products.error || categories.error) throw new Error("The shop is temporarily unavailable. Please try again.");
  const suppliers = getSupplierProducts();
  const filtered = suppliers.filter(product => !category || product.category === category);
  const categoryCounts = new Map((categories.data as { category: string; product_count: number }[]).map(item => [item.category, Number(item.product_count)]));
  for (const product of suppliers) categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
  const merchantCount = products.count || 0;
  return {
    products: [...(products.data as unknown as ShopProduct[]), ...supplierPage(filtered, merchantCount, page).map(supplierProduct)],
    categories: [...categoryCounts].sort(([a], [b]) => a.localeCompare(b)).map(([category, product_count]) => ({ category, product_count })),
    total: merchantCount + filtered.length, page,
  };
}
export async function getShopProduct(id: string) {
  if (id.startsWith("supplier-")) {
    const product = getSupplierProducts().find(product => product.id === id);
    return product ? supplierProduct(product) : null;
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await createAdminClient().from("shop_visible_listings").select(fields).eq("id", id).eq("status", "published").maybeSingle();
  if (error) throw new Error("Unable to load this product.");
  return data as unknown as ShopProduct | null;
}
export function productImage(url: string | null) {
  try { return url && ["https:","http:"].includes(new URL(url).protocol) ? url : null; } catch { return null; }
}
