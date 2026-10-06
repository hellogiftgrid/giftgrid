import Link from "next/link";
import { getShopCatalog, productImage } from "@/lib/shop/catalog";
import OpenSourcingPanel from "@/components/public/OpenSourcingPanel";
export const dynamic = "force-dynamic";
export const metadata = { title: "GiftGrid Market", alternates: { canonical: "https://community.degiftgrid.com/market" } };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const params = await searchParams;
  const category = (params.category || "").slice(0,128);
  const page = Math.max(1,Math.min(10000,Math.floor(Number(params.page)) || 1));
  const catalog = await getShopCatalog(category,page);
  const categoryUrl = (value: string, number = 1) => `/market?${new URLSearchParams({ ...(value ? { category: value } : {}), ...(number > 1 ? { page: String(number) } : {}) })}`;
  return <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><OpenSourcingPanel />
    <h1 className="text-3xl font-bold text-slate-950">GiftGrid Market</h1>
    <p className="mt-2 text-sm text-slate-600">Discover products from GiftGrid merchants and suppliers. Request a merchant quote or visit a supplier for current pricing and ordering.</p>
    <nav aria-label="Product categories" className="mt-6 flex flex-wrap gap-2">
      <Link href="/market" aria-current={!category ? "page" : undefined} className={`rounded-full border px-4 py-3 text-sm font-semibold ${!category ? "bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}>All products</Link>
      {catalog.categories.map(item => <Link key={item.category} href={categoryUrl(item.category)} aria-current={category === item.category ? "page" : undefined} className={`rounded-full border px-4 py-3 text-sm font-semibold ${category === item.category ? "bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}>{item.category} ({item.product_count})</Link>)}
    </nav>
    <p className="mt-5 text-sm text-slate-500">{catalog.total} {catalog.total === 1 ? "product" : "products"}{category ? ` in ${category}` : ""}</p>
    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {catalog.products.map(product => <article key={product.id} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Link href={`/market/${product.id}`} className="block">
          {productImage(product.hero_image_url) ? <img src={productImage(product.hero_image_url)!} alt={product.title} loading="lazy" className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-slate-100 text-4xl text-slate-400" aria-label="No product image">G</div>}
          <div className="p-5"><p className="text-xs font-semibold text-blue-600">{product.category}</p><h2 className="mt-2 break-words text-lg font-bold text-slate-950">{product.title}</h2><p className="mt-1 text-xs text-slate-500">{product.supplier?.name || product.merchant_profiles?.business_name || "GiftGrid merchant"}</p>{product.supplier && <p className="mt-2 text-xs font-semibold text-amber-800">External supplier · {product.supplier.source}</p>}<p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-slate-600">{product.short_description}</p><p className="mt-4 text-sm font-semibold text-slate-700">{product.price_range || (product.supplier ? "Check supplier pricing" : "Request pricing")}</p><div className="mt-2 flex flex-wrap items-center gap-2 text-xs">{(product.average_rating ?? 0) >= 4.5 && (product.review_count ?? 0) > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">Top rated</span>}{(product.review_count ?? 0) > 0 && <span className="font-semibold text-amber-600">★ {product.average_rating?.toFixed?.(1)} ({product.review_count})</span>}{(product.like_count ?? 0) > 0 && <span className="text-slate-500">♥ {product.like_count}</span>}</div>{product.minimum_order_quantity !== null && <p className="mt-1 text-xs text-slate-500">Minimum order: {product.minimum_order_quantity}</p>}{product.supplier && <p className="mt-2 text-xs text-slate-500">Price and availability confirmed by the supplier at checkout.</p>}</div>
        </Link>
      </article>)}
    </div>
    {!catalog.products.length && <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">No published products in this category yet.</p>}
    <nav aria-label="Market pages" className="mt-8 flex justify-between gap-4">{page > 1 ? <Link href={categoryUrl(category,page-1)} className="rounded-xl bg-white px-5 py-3">Previous</Link> : <span />}{page * 24 < catalog.total && <Link href={categoryUrl(category,page+1)} className="rounded-xl bg-white px-5 py-3">Next</Link>}</nav>
    <Link href="/dashboard/listings" className="mt-6 inline-block py-3 text-sm font-semibold text-blue-600">Merchant? Manage your product listings</Link>
  </main>;
}
