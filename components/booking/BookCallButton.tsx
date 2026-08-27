"use client";

import Link from "next/link";

type Props = {
  adminSlug: string;
  label?: string;
  variant?: "primary" | "secondary";
};

export default function BookCallButton({
  adminSlug,
  label = "Book a Call",
  variant = "primary",
}: Props) {
  const href = `/book/${encodeURIComponent(adminSlug)}`;

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50"
      >
        {label}
        <span aria-hidden="true">→</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4338CA]"
    >
      {label}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
