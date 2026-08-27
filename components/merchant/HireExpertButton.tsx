"use client";

import Link from "next/link";

type Props = {
  adminSlug?: string;
  label?: string;
};

export default function HireExpertButton({
  adminSlug = "support",
  label = "Book a Call",
}: Props) {
  return (
    <Link
      href={`/book/${encodeURIComponent(adminSlug)}`}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4338CA]"
    >
      {label}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
