"use client";
import { useState } from "react";
import Link from "next/link";

export default function ProductActions({ listingId, merchantUserId }: { listingId: string; merchantUserId?: string | null }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggleLike() {
    setBusy(true);
    const res = await fetch(`/api/listings/${listingId}/like`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (res.status === 401) return setMessage("Sign in to like products.");
    if (!res.ok) return setMessage(data.error || "Unable to update like.");
    setLiked(data.liked);
    setLikes(data.likes);
  }

  async function messageMerchant() {
    if (!merchantUserId) return setMessage("This merchant cannot be messaged yet.");
    const res = await fetch("/api/community/connections", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ targetId: merchantUserId }) });
    const data = await res.json();
    if (res.status === 401) return setMessage("Sign in to message this merchant.");
    if (!res.ok) return setMessage(data.error || "Unable to open the inbox.");
    window.location.assign(`/messages?conversation=${encodeURIComponent(data.connection.id)}`);
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button onClick={toggleLike} disabled={busy} aria-pressed={liked} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${liked ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-300 text-slate-700"}`}>
        {liked ? "♥ Liked" : "♡ Like"}{likes !== null ? ` (${likes})` : ""}
      </button>
      <button onClick={messageMerchant} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Message merchant</button>
      {message && <p className="text-sm text-slate-600">{message} {message.startsWith("Sign in") && <Link href="/auth/sign-in" className="font-semibold text-blue-700 underline">Sign in</Link>}</p>}
    </div>
  );
}
