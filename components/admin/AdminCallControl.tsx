"use client";

import { useState } from "react";

export default function AdminCallControl({
  slug,
}: {
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.degiftgrid.com";

  const link = `${siteUrl}/book/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
        Your booking page
      </div>

      <div className="mt-2 text-sm font-semibold text-slate-900">
        Share this link with merchants and clients.
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1 rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm text-slate-600">
          <span className="break-all">{link}</span>
        </div>

        <button
          type="button"
          onClick={copy}
          className="rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white hover:bg-[#4338CA]"
        >
          {copied ? "Copied" : "Copy link"}
        </button>

        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-indigo-200 bg-white px-5 py-3 text-center text-sm font-bold text-indigo-700 hover:bg-indigo-50"
        >
          Open
        </a>
      </div>
    </div>
  );
}
