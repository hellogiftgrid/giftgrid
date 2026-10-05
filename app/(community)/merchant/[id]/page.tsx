import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicMember } from "@/lib/community/public-profile";

export const dynamic = "force-dynamic";
export default async function MerchantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, merchant = await getPublicMember(id);
  if (!merchant || merchant.kind !== "merchant") notFound();
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
    <Link href="/merchant" className="text-sm font-semibold text-blue-700">← All merchants</Link>
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">{merchant.avatar ? <img src={merchant.avatar} alt="" className="size-20 rounded-full object-cover"/> : <span className="flex size-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">{merchant.name.slice(0,1)}</span>}<div className="min-w-0"><h1 className="break-words text-3xl font-bold">{merchant.businessName || merchant.name}</h1><p className="mt-2 text-sm capitalize text-slate-500">{merchant.category || "GiftGrid merchant"}{merchant.country ? ` · ${merchant.country}` : ""}</p>{merchant.approved && <p className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Approved merchant</p>}</div></div>
      <p className="mt-5 whitespace-pre-wrap break-words leading-7 text-slate-600">{merchant.bio || "This merchant is completing its GiftGrid profile."}</p>
    </article>
    <section><h2 className="text-2xl font-bold text-slate-950">Gift products</h2><p className="mt-1 text-sm text-slate-500">Approved product listings from this merchant.</p><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{merchant.products.map((product: {id:string;title:string;short_description:string;hero_image_url:string|null;price_range:string|null;minimum_order_quantity:number})=><article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">{product.hero_image_url && <img src={product.hero_image_url} alt={product.title} className="h-48 w-full bg-slate-50 object-contain"/>}<div className="p-4"><h3 className="font-bold">{product.title}</h3><p className="mt-2 line-clamp-3 text-sm text-slate-600">{product.short_description}</p><p className="mt-3 text-xs font-semibold text-slate-500">MOQ {product.minimum_order_quantity}{product.price_range ? ` · ${product.price_range}` : ""}</p><Link href={`/market/${product.id}`} className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white">View product</Link></div></article>)}</div>{!merchant.products.length && <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">This merchant has not published any products yet.</p>}</section>
  </main>;
}
