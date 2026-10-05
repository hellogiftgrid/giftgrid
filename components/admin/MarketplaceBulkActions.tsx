"use client";

import { useState, useTransition } from "react";

export default function MarketplaceBulkActions({ approveAll, deleteAll }: { approveAll: () => Promise<string>; deleteAll: () => Promise<string> }) {
  const [busy, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return <div className="flex flex-wrap items-center gap-2">
    <button disabled={busy} onClick={() => startTransition(async () => { try { setMessage(await approveAll()); } catch { setMessage("Could not approve listings. Refresh and try again."); } })} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Working…" : "Approve all with images"}</button>
    <button disabled={busy} onClick={() => { if (!window.confirm("Delete every merchant product listing, including published listings? This cannot be undone.")) return; startTransition(async () => { try { setMessage(await deleteAll()); } catch { setMessage("Could not delete all listings. Refresh and try again."); } }); }} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50">Delete all listings</button>
    {message && <span role="status" className="basis-full text-sm text-slate-600">{message}</span>}
  </div>;
}
