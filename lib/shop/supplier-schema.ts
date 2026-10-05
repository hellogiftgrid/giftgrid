export type SupplierProduct = {
  id: string;
  source: "aliexpress" | "faire";
  source_id: string;
  source_url: string;
  supplier_name: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  price: number | null;
  currency: string | null;
  minimum_order_quantity: number | null;
  availability: "in_stock" | "unknown" | "out_of_stock";
  checked_at: string;
};

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Each product must be an object.");
  return value as Record<string, unknown>;
}
function text(value: unknown, field: string, max: number) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new Error(`${field} must contain 1 to ${max} characters.`);
  return value.trim();
}
function httpsUrl(value: unknown, field: string) {
  const url = new URL(text(value, field, 2048));
  if (url.protocol !== "https:" || url.username || url.password || url.port) throw new Error(`${field} must be a public HTTPS URL without credentials or a custom port.`);
  return url;
}
const hostMatches = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

// Accepted feeds contain supplier-provided data, not invented stock or activity.
// This is deliberately independent of database migrations and Shopify.
export function parseSupplierCatalog(value: unknown, now = Date.now()): SupplierProduct[] {
  const input = object(value);
  if (input.version !== 1 || !Array.isArray(input.products) || input.products.length > 10000) {
    throw new Error("Provide version: 1 and a products array with at most 10,000 entries.");
  }
  const ids = new Set<string>();
  return input.products.map((value, index) => {
    try {
      const row = object(value);
      if (row.source !== "aliexpress" && row.source !== "faire") throw new Error("source must be aliexpress or faire.");
      const source = row.source;
      const sourceId = text(row.source_id, "source_id", 100);
      if (!/^[a-zA-Z0-9_-]+$/.test(sourceId)) throw new Error("source_id must contain only letters, digits, underscores, or hyphens.");
      const id = `supplier-${source}-${sourceId}`;
      if (ids.has(id)) throw new Error("Duplicate supplier product ID.");
      ids.add(id);
      const sourceUrl = httpsUrl(row.source_url, "source_url");
      const sourceDomains = source === "faire" ? ["faire.com"] : ["aliexpress.com", "aliexpress.us"];
      if (!sourceDomains.some(domain => hostMatches(sourceUrl.hostname, domain))) throw new Error("source_url must link directly to the selected marketplace.");
      if (source === "faire" ? !/^\/product\/[^/]+\/?$/.test(sourceUrl.pathname) : !/^\/item\/\d+\.html$/.test(sourceUrl.pathname)) {
        throw new Error("source_url must be a product page, not a store or redirect link.");
      }
      const imageUrl = httpsUrl(row.image_url, "image_url");
      const imageDomains = source === "faire" ? ["faire.com", "fairecdn.com"] : ["alicdn.com", "aliexpress-media.com"];
      if (!imageDomains.some(domain => hostMatches(imageUrl.hostname, domain))) throw new Error("image_url must use the supplier marketplace's image CDN.");
      let price: number | null = null, currency: string | null = null;
      if (row.price !== null && row.price !== undefined) {
        if (typeof row.price !== "number" || !Number.isFinite(row.price) || row.price < 0) throw new Error("price must be a nonnegative number or null.");
        price = row.price;
        currency = text(row.currency, "currency", 3).toUpperCase();
        if (!/^[A-Z]{3}$/.test(currency)) throw new Error("currency must be a three-letter currency code.");
      }
      const minimum = row.minimum_order_quantity ?? null;
      if (minimum !== null && (typeof minimum !== "number" || !Number.isSafeInteger(minimum) || minimum < 1)) throw new Error("minimum_order_quantity must be a positive integer or null.");
      const availability = row.availability ?? "unknown";
      if (availability !== "in_stock" && availability !== "out_of_stock" && availability !== "unknown") throw new Error("Invalid availability.");
      const checkedAt = text(row.checked_at, "checked_at", 40);
      if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(checkedAt) || !Number.isFinite(Date.parse(checkedAt)) || Date.parse(checkedAt) > now + 300000) throw new Error("checked_at must be a valid, non-future ISO timestamp with a timezone.");
      return {
        id, source, source_id: sourceId, source_url: sourceUrl.href,
        supplier_name: text(row.supplier_name, "supplier_name", 120), title: text(row.title, "title", 200),
        description: text(row.description, "description", 10000), category: text(row.category, "category", 128),
        image_url: imageUrl.href, price, currency, minimum_order_quantity: minimum,
        availability, checked_at: new Date(checkedAt).toISOString(),
      };
    } catch (error) { throw new Error(`Product ${index + 1}: ${error instanceof Error ? error.message : "Invalid product."}`); }
  });
}

export function currentSupplierProducts(products: SupplierProduct[], now = Date.now()) {
  return products.filter(product => product.availability !== "out_of_stock" && now - Date.parse(product.checked_at) <= 7 * 86400000 && Date.parse(product.checked_at) <= now + 300000);
}

export function supplierPage<T>(products: T[], merchantCount: number, page: number, pageSize = 24) {
  const offset = (page - 1) * pageSize;
  const merchantSlots = Math.min(pageSize, Math.max(0, merchantCount - offset));
  const supplierOffset = Math.max(0, offset - merchantCount);
  return products.slice(supplierOffset, supplierOffset + pageSize - merchantSlots);
}
