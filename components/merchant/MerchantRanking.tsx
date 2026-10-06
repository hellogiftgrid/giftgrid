"use client";
import { useEffect, useState } from "react";

type Row = { merchant_id: string; business_name: string; business_category: string | null; country: string | null; ai_rating: number; average_rating: number; clicks: number; live_listings: number; rank: number };

export default function MerchantRanking() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { fetch("/api/merchants/ranking").then((r) => r.json()).then((d) => setRows(d.ranking || [])).catch(() => {}); }, []);
  if (!rows.length) return null;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">Top merchants by GiftGrid ranking</h2>
      <p className="text-xs text-slate-500">Ranked by AI rating from product clicks, impressions, and reviews.</p>
      <ol className="mt-4 divide-y divide-slate-100">
        {rows.slice(0, 10).map((row) => (
          <li key={row.merchant_id} className="flex items-center justify-between py-3 text-sm">
            <span className="font-semibold text-slate-800">#{row.rank} {row.business_name}</span>
            <span className="text-slate-500">AI {row.ai_rating}★ · {row.clicks} clicks · {row.live_listings} live</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
