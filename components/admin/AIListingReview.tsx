"use client";

import { useState } from "react";

type Review = { summary: string; concerns: string[]; recommendation: "looks_ready" | "needs_changes" | "human_attention" };

export default function AIListingReview({ listingId }: { listingId: string }) {
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runReview() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/marketplace/ai-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI review failed.");
      setReview(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "AI review failed.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="mt-3">
    <button type="button" disabled={loading} onClick={runReview} className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800 disabled:opacity-50">{loading ? "AI reviewing…" : review ? "Run AI review again" : "Run AI review"}</button>
    {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
    {review && <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/70 p-4 text-sm text-slate-700">
      <p className="font-bold text-violet-900">AI suggestion: {review.recommendation.replaceAll("_", " ")}</p>
      <p className="mt-1">{review.summary}</p>
      {review.concerns.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5">{review.concerns.map((concern, index) => <li key={index}>{concern}</li>)}</ul>}
      <p className="mt-2 text-xs text-slate-500">Assistive review only. A super-admin makes the final decision.</p>
    </div>}
  </div>;
}
