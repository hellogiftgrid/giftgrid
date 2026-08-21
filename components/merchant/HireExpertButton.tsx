"use client";

import { useState } from "react";

type Props = {
  source?: "audit" | "recommendations";
  recommendation?: string;
  storeName?: string;
};

export default function HireExpertButton({
  source = "audit",
  recommendation,
  storeName,
}: Props) {
  const [open, setOpen] = useState(false);

  const subject =
    source === "audit"
      ? `GiftGrid Expert Help — ${storeName || "Store Audit"}`
      : `GiftGrid Expert Help — Recommendation`;

  const body = [
    `Hello GiftGrid Support,`,
    "",
    `I would like help improving my store.`,
    storeName ? `Store: ${storeName}` : "",
    recommendation
      ? `Recommendation I need help with: ${recommendation}`
      : "",
    "",
    "Please let me know how I can proceed.",
  ]
    .filter(Boolean)
    .join("\n");

  const mailto = `mailto:support@degiftgrid.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4338CA]"
      >
        Hire an Expert
        <span aria-hidden="true">→</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
              GiftGrid Expert Support
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Get help improving your store
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Your request will be sent to the GiftGrid expert support team.
            </p>

            {recommendation && (
              <div className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm text-slate-700">
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
                  Focus area
                </div>
                {recommendation}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <a
                href={mailto}
                className="flex-1 rounded-xl bg-[#4F46E5] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#4338CA]"
              >
                Email support
              </a>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              support@degiftgrid.com
            </p>
          </div>
        </div>
      )}
    </>
  );
}
