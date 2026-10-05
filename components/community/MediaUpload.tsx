"use client";
import { useState } from "react";

export default function MediaUpload({ onUploaded, onBusyChange, disabled = false }: {
  onUploaded: (path: string, url: string) => void;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">Add photo<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy || disabled} onChange={async event => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError("");
    if (!file.size || file.size > 4194304 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP photo up to 4 MB."); input.value = ""; return;
    }
    setBusy(true); onBusyChange?.(true);
    try {
      const body = new FormData(); body.set("file", file);
      const response = await fetch("/api/community/media", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Photo upload failed.");
      onUploaded(result.path, result.url);
    } catch (error) { setError(error instanceof Error ? error.message : "Photo upload failed."); }
    finally { setBusy(false); onBusyChange?.(false); input.value = ""; }
  }} /></label>{busy && <span role="status" className="ml-2 text-sm">Uploading...</span>}<p className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP up to 4 MB.</p>{error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}</div>;
}
