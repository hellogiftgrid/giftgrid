import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

function publicAddress(address: string) {
  if (/^::ffff:/i.test(address)) return publicAddress(address.slice(7));
  if (address.includes(":")) return !/^(::1|::|fc|fd|fe80|ff)/i.test(address);
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some(part => part < 0 || part > 255)) return false;
  const [a,b] = parts;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127));
}

function plainText(value: string) {
  return value.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ").replace(/<\/(p|li|div|h[1-6])\s*>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/[\t\r ]+/g, " ").replace(/ *\n */g, "\n").trim().slice(0, 20000);
}

function productsFromJson(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(productsFromJson);
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;
  const types = Array.isArray(object["@type"]) ? object["@type"] : [object["@type"]];
  const result = types.some(type => typeof type === "string" && type.toLowerCase() === "product") ? [object] : [];
  return [...result, ...productsFromJson(object["@graph"]), ...productsFromJson(object.mainEntity), ...productsFromJson(object.itemListElement), ...productsFromJson(object.item)];
}

function jsonLdBlocks(html: string) {
  const structured: Record<string, unknown>[] = [];
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { structured.push(...productsFromJson(JSON.parse(match[1]))); } catch { /* Ignore malformed JSON-LD blocks. */ }
  }
  return structured;
}

function parseProduct(html: string) {
  const product = jsonLdBlocks(html)[0];
  const meta = (name: string) => html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, "i"))?.[1] || "";
  const title = String(product?.name || product?.headline || meta("og:title") || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/&amp;/gi, "&").trim().slice(0, 240);
  const description = plainText(String(product?.description || meta("og:description") || ""));
  const images = Array.isArray(product?.image) ? product.image : [product?.image];
  const image = images.find(value => typeof value === "string") || (images[0] && typeof images[0] === "object" ? (images[0] as Record<string,unknown>).url : null) || meta("og:image") || null;
  const offer = Array.isArray(product?.offers) ? product.offers[0] : product?.offers;
  const price = offer && typeof offer === "object" ? offer as Record<string,unknown> : {};
  const priceRange = price.price ? `${String(price.priceCurrency || "")} ${String(price.price)}`.trim() : null;
  return { title, description, image: typeof image === "string" && image.startsWith("https://") ? image : null, category: String(product?.category || "Gifts").slice(0, 120), priceRange };
}

async function readPublicHtml(url: URL) {
  if (url.protocol !== "https:" || url.port || url.username || url.password || !url.hostname.includes(".") || url.hostname === "localhost" || isIP(url.hostname)) throw new Error("Enter a public HTTPS product or collection page URL.");
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(item => !publicAddress(item.address))) throw new Error("That URL does not resolve to a public website.");
  const response = await fetch(url, { headers: { Accept: "text/html" }, signal: AbortSignal.timeout(12000), redirect: "error", cache: "no-store" });
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) throw new Error("Could not read the public product page.");
  const length = Number(response.headers.get("content-length") || 0);
  if (length > 3_000_000 || !response.body) throw new Error("The product page is too large to read.");
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let total = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; total += value.byteLength; if (total > 3_000_000) { await reader.cancel(); throw new Error("The product page is too large to read."); } chunks.push(value); }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

function productUrls(html: string, base: URL) {
  const urls = new Set<string>();
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    try {
      const candidate = new URL(match[1].replace(/&amp;/g, "&"), base);
      if (candidate.hostname === base.hostname && /^\/(?:product|products)\/[^/?#]+\/?$/i.test(candidate.pathname)) urls.add(candidate.href);
    } catch { /* Ignore malformed product links. */ }
    if (urls.size > 100) break;
  }
  const all = [...urls];
  return { urls: all.slice(0, 100), truncated: all.length > 100 };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in as a merchant to import a product." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role,is_active").eq("id", user.id).maybeSingle();
  if (profile?.role !== "merchant" || profile.is_active === false) return NextResponse.json({ error: "An active merchant account is required." }, { status: 403 });
  const { data: merchant } = await supabase.from("merchant_profiles").select("id").eq("user_id", user.id).maybeSingle();
  if (!merchant) return NextResponse.json({ error: "Complete merchant setup before importing products." }, { status: 403 });

  const body = await request.json().catch(() => null);
  try {
    const productUrl = new URL(typeof body?.productUrl === "string" ? body.productUrl : "");
    const html = await readPublicHtml(productUrl);
    const structured = jsonLdBlocks(html);
    const collection = /\/(?:product-category|product-tag|collections|shop)\//i.test(productUrl.pathname) || structured.length > 1;
    let truncated = structured.length > 100;
    let parsed = structured.map(product => {
      const asJson = `<script type="application/ld+json">${JSON.stringify(product)}</script>`;
      return parseProduct(asJson);
    }).filter(product => product.title && product.description && product.image);
    if (collection && !parsed.length) {
      const { urls, truncated: tooManyUrls } = productUrls(html, productUrl);
      truncated = truncated || tooManyUrls;
      const batches: string[][] = [];
      for (let index = 0; index < urls.length; index += 8) batches.push(urls.slice(index, index + 8));
      for (const batch of batches) {
        const fetched = await Promise.allSettled(batch.map(async value => parseProduct(await readPublicHtml(new URL(value)))));
        parsed.push(...fetched.flatMap(result => result.status === "fulfilled" && result.value.title && result.value.description && result.value.image ? [result.value] : []));
      }
    }
    if (parsed.length > 100) truncated = true;
    parsed = parsed.slice(0, collection ? 100 : 1);
    if (!parsed.length) return NextResponse.json({ error: collection ? "No products with both a name, description, and image were found in that collection." : "A product name, description, and image are required to import this page." }, { status: 422 });
    const admin = createAdminClient();
    const { data: existing } = await admin.from("merchant_listings").select("title").eq("merchant_id", merchant.id);
    const existingTitles = new Set((existing || []).map(item => item.title.trim().toLocaleLowerCase()));
    const unique = parsed.filter(product => { const key = product.title.toLocaleLowerCase(); if (existingTitles.has(key)) return false; existingTitles.add(key); return true; });
    if (!unique.length) return NextResponse.json({ error: "These products are already in your listings." }, { status: 409 });
    const rows = unique.map(product => ({ merchant_id: merchant.id, title: product.title, short_description: product.description.slice(0, 500), description: product.description, category: product.category, minimum_order_quantity: 50, price_range: product.priceRange, hero_image_url: product.image, lead_time: null, ships_internationally: false, customization_available: false, status: "pending_review" }));
    const { error } = await admin.from("merchant_listings").insert(rows);
    if (error) return NextResponse.json({ error: "The products were read, but GiftGrid could not save them. Please retry." }, { status: 503 });
    const withImages = unique.filter(product => product.image).length;
    return NextResponse.json({ imported: rows.length, withImages, truncated, status: "pending_review", message: `${rows.length} ${collection ? "collection products" : "product"} imported for review. Images were added for ${withImages} products. MOQ is set to 50.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read that page.";
    return NextResponse.json({ error: `${message} Check that the URL is a public HTTPS WordPress/WooCommerce product or collection page.` }, { status: 422 });
  }
}
