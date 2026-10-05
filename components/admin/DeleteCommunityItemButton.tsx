"use client";

import { useState } from "react";

export default function DeleteCommunityItemButton({ id, kind, label }: { id: string; kind: "community_post" | "sourcing_request"; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    const warning = kind === "sourcing_request"
      ? "Delete this sourcing request and its private brief, merchant replies, and quotes? This cannot be undone."
      : "Delete this community post and its comments and reactions? This cannot be undone.";
    if (busy || !window.confirm(warning)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/community/items/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete this item.");
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this item.");
      setBusy(false);
    }
  }

  return <div className="shrink-0">
    <button type="button" disabled={busy} onClick={() => void remove()} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">
      {busy ? "Deleting…" : `Delete ${label}`}
    </button>
    {error && <p role="alert" className="mt-2 max-w-56 text-xs text-red-700">{error}</p>}
  </div>;
}
