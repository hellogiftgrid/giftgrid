"use client";
import { useEffect, useState } from "react";

type Review = { id: string; profile_id: string; rating: number; body: string | null; created_at: string };

export default function ListingReviews({ listingId }: { listingId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/listings/${listingId}/reviews`).then((r) => r.json()).then((d) => setReviews(d.reviews || [])).catch(() => {});
    fetch(`/api/listings/${listingId}/track`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "impression" }) }).catch(() => {});
  }, [listingId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/listings/${listingId}/reviews`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ rating, body }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error || "Unable to save your review.");
    setMessage("Review saved.");
    setBody("");
    fetch(`/api/listings/${listingId}/reviews`).then((r) => r.json()).then((d) => setReviews(d.reviews || []));
  }

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">Reviews {avg && <span className="text-amber-600">· {avg} / 5 ({reviews.length})</span>}</h2>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <label className="text-sm font-semibold text-slate-700">Your rating
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="mt-1 rounded-lg border border-slate-300 px-3 py-2">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
          </select>
        </label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your experience (optional)" maxLength={2000} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={3} />
        <button className="self-start rounded-xl bg-blue-600 px-5 py-2 text-white">Post review</button>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </form>
      <ul className="mt-6 space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="border-t border-slate-100 pt-4">
            <p className="font-semibold text-amber-600">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
            {r.body && <p className="mt-1 text-sm text-slate-700">{r.body}</p>}
            <p className="mt-1 text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
          </li>
        ))}
        {!reviews.length && <li className="text-sm text-slate-500">No reviews yet — be the first.</li>}
      </ul>
    </section>
  );
}
