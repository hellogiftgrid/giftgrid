"use client";

import Link from "next/link";

type Props = {
  adminSlug?: string;
  label?: string;
  variant?: "primary" | "secondary";
};

export default function BookCallButton({
  adminSlug,
  label = "Book a Call",
  variant = "primary",
}: Props) {
  const href = adminSlug
    ? `/book/${encodeURIComponent(adminSlug)}`
    : "/book";

  const classes =
    variant === "secondary"
      ? "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50"
      : "inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4338CA]";

  return (
    <Link href={href} className={classes}>
      {label}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
