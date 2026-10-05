"use client";

import AuthControls from "@/components/shared/AuthControls";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/community", label: "Community" },
  { href: "/sourcing", label: "Open Requests" },
  { href: "/about", label: "What We Do" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/buyers/apply", label: "For Buyers" },
  { href: "/market", label: "Market" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isCommunity = pathname === "/community" || pathname === "/giftgrid" || (typeof window !== "undefined" && window.location.hostname === "community.degiftgrid.com");

  if (isCommunity) return null;

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className="mx-auto flex max-w-[1180px] items-center justify-between rounded-full border border-white/80 bg-white/90 px-4 py-2.5 shadow-[0_10px_35px_rgba(15,23,42,.10)] backdrop-blur-xl sm:px-5">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-horizontal.png" alt="GiftGrid" className="theme-logo h-9 w-auto object-contain" />
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
          <Link href="/buyers/apply" className="text-[14.5px] font-semibold text-indigo-700 hover:text-indigo-900">
            For Buyers
          </Link>
          <AuthControls />
          <Link
            href="/auth/join"
            className="rounded-full px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ background: "#1D4ED8" }}
          >
            Join GiftGrid
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
            <Link href="/buyers/apply" className="text-[15px] font-semibold text-indigo-700">
              For Buyers
            </Link>
            <AuthControls />
            <Link
              href="/auth/sign-up"
              className="rounded-full px-5 py-3 text-center text-[14px] font-semibold text-white"
              style={{ background: "#1D4ED8" }}
            >
              Apply as Merchant
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
