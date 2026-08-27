"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/store-review", label: "Store Review" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-borderCustom bg-primary/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1180px] items-center justify-between px-7 py-3">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-horizontal.png" alt="GiftGrid" className="h-9 w-auto object-contain" />
        </Link>

        <ul className="hidden gap-8 text-[14.5px] text-textSecondary md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-textPrimary">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/auth/sign-in" className="text-[14.5px] text-textSecondary hover:text-textPrimary">
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-full px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ background: "#4F46E5" }}
          >
            Apply as Merchant
          </Link>
        </div>

        <button
          className="text-textPrimary md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-borderCustom bg-primary px-7 py-6 md:hidden">
          <ul className="flex flex-col gap-5 text-[15px] text-textSecondary">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/auth/sign-in" className="text-[15px] text-textSecondary">
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-full px-5 py-3 text-center text-[14px] font-semibold text-white"
              style={{ background: "#4F46E5" }}
            >
              Apply as Merchant
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
