import Link from "next/link";
import { notFound } from "next/navigation";
import { getShopProduct, productImage } from "@/lib/shop/catalog";
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getShopProduct(id);
  if (!product) notFound();
  return <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
    <Link href="/market" className="inline-block py-3 text-sm font-semibold text-blue-600">Back to the market</Link>
    <article className="mt-4 grid overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-2">
      {productImage(product.hero_image_url) ? <img src={productImage(product.hero_image_url)!} alt={product.title} className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-slate-100 text-6xl text-slate-400">G</div>}
      <div className="min-w-0 p-6 sm:p-8">
        <p className="text-sm text-blue-600">{product.category}</p>
        <h1 className="mt-3 break-words text-3xl font-bold text-slate-950">{product.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{product.supplier?.name || product.merchant_profiles?.business_name || "GiftGrid merchant"}</p>
        {product.supplier && <p className="mt-2 text-sm font-semibold text-amber-800">External supplier · {product.supplier.source}</p>}
        <p className="mt-5 break-words whitespace-pre-wrap text-sm leading-7 text-slate-600">{product.description || product.short_description}</p>
        <p className="mt-6 font-bold text-slate-900">{product.price_range || (product.supplier ? "Check supplier pricing" : "Contact the merchant for pricing")}</p>
        {product.minimum_order_quantity !== null && <p className="mt-2 text-sm text-slate-600">Minimum order: {product.minimum_order_quantity}</p>}
        {product.lead_time && <p className="mt-2 text-sm text-slate-600">Lead time: {product.lead_time}</p>}
        {product.customization_available && <p className="mt-2 text-sm text-slate-600">Customization available</p>}
        {product.supplier ? <>
          <p className="mt-3 text-sm text-slate-600">{product.supplier.availability === "in_stock" ? "Supplier reported in stock" : "Confirm stock with the supplier"} · Checked {product.supplier.checked_at.slice(0, 10)}.</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Ordering, shipping, taxes, returns, and final availability are handled by the supplier. This product is sold outside GiftGrid.</p>
          <a href={product.supplier.url} target="_blank" rel="noopener noreferrer sponsored" className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white">View on {product.supplier.source}</a>
        </> : <Link href={`/dashboard?listing=${id}`} className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white">Request a quote</Link>}
      </div>
    </article>
  </main>;
}
