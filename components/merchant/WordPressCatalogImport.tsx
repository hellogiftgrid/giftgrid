"use client";

import { useState, type FormEvent } from "react";

export default function WordPressCatalogImport({ onImported }: { onImported: () => void }) {
  const [productUrl, setProductUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(false);

  async function importProducts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setNotice(""); setError(false);
    try {
      const response = await fetch("/api/merchant/wordpress-product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Product import failed.");
      setNotice(`${data.message}${data.truncated ? " Only the first 100 products were imported; split the collection into smaller pages to continue." : ""}`);
      onImported();
    } catch (reason) {
      setError(true); setNotice(reason instanceof Error ? reason.message : "Product import failed.");
    } finally { setBusy(false); }
  }

  return <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
    <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">WordPress / WooCommerce import</p>
    <h2 className="mt-1 text-lg font-bold text-slate-950">Pull products from your store</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">Paste a public product page to import one product, or a collection/category page to import its products and images. Imported listings use MOQ 50 and wait for super-admin approval before appearing in the shop.</p>
    <form onSubmit={importProducts} className="mt-4 flex flex-col gap-3 sm:flex-row"><input type="url" required value={productUrl} onChange={event => setProductUrl(event.target.value)} placeholder="https://your-store.com/product-category/gifts" aria-label="WordPress or WooCommerce product or collection page URL" className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm"/><button disabled={busy} className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Reading products…" : "Import product or collection"}</button></form>
    {notice && <p role={error ? "alert" : "status"} className={`mt-3 text-sm ${error ? "text-red-700" : "text-emerald-900"}`}>{notice}</p>}
  </section>;
}
