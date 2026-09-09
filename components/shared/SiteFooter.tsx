"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const COMMUNITY_URL = "https://www.degiftgrid.com/community";
const groups = [
  ["Product", [["/how-it-works", "How It Works"], ["/store-review", "Store Review"], ["/blog", "GiftGrid Blog"], [COMMUNITY_URL, "Community"]]],
  ["Company", [["/giftgrid", "About GiftGrid"], ["/about", "Our Company"], ["/faq", "FAQ"], ["/contact", "Contact"]]],
  ["Legal", [["/privacy", "Privacy"], ["/terms", "Terms"], ["/cookies", "Cookies"]]],
] as const;

export default function SiteFooter() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en");

  if (pathname === "/community" || pathname === "/giftgrid") return null;

  async function submitVisitorInvite(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/visitor/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, consent }) });
    const result = await response.json();
    setMessage(response.ok ? "Check your inbox for the next step." : result.error || "Unable to send the invite.");
    if (response.ok) setEmail("");
  }

  function changeLanguage(value: string) {
    setLanguage(value);
    document.cookie = `giftgrid_language=${value};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.lang = value;
  }

  return <footer className="border-t border-slate-200 bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
    <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <div><Link href="/" className="inline-flex items-center gap-3"><img src="/images/logo-full.png" alt="GiftGrid" className="h-9 w-auto object-contain brightness-0 invert" /></Link><p className="mt-4 text-sm leading-6 text-slate-400">A practical community for brands, gifting teams, and partners building better commercial relationships.</p><a href={COMMUNITY_URL} className="mt-4 inline-flex rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Join the Community</a><p className="mt-5 text-xs text-slate-500">
            {/* ── App store badges ── */}
            <div className="mt-5 flex flex-col gap-2.5">
              <a href="https://apps.apple.com/app/giftgrid/YOUR_APP_ID"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-slate-600 bg-slate-800 px-4 text-white hover:bg-slate-700">
                <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[9px] leading-none text-slate-300">Download on the</p>
                  <p className="text-sm font-bold leading-tight">App Store</p>
                </div>
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.hellogiftgrid.app"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-slate-600 bg-slate-800 px-4 text-white hover:bg-slate-700">
                <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[9px] leading-none text-slate-300">Get it on</p>
                  <p className="text-sm font-bold leading-tight">Google Play</p>
                </div>
              </a>
            </div>
            {/* ── Community link ── */}
            <a href="/community"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
              Join the Community →
            </a>
            <a href="mailto:support@degiftgrid.com" className="hover:text-slate-300">support@degiftgrid.com</a></p></div>
      {groups.map(([heading, links]) => <div key={heading}><p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">{heading}</p><ul className="space-y-2.5">{links.map(([href, label]) => <li key={href}><Link href={href} className="text-sm text-slate-300 transition hover:text-white">{label}</Link></li>)}</ul></div>)}
    </div>
    <div className="mt-12 grid gap-8 border-t border-slate-800 pt-8 lg:grid-cols-[1fr_auto] lg:items-end"><form onSubmit={submitVisitorInvite} className="max-w-xl"><p className="text-sm font-semibold">Stay connected</p><p className="mt-1 text-xs text-slate-500">Get practical updates for brands and gifting teams.</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@example.com" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400" /><button type="submit" className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400">Notify me</button></div><label className="mt-3 flex items-start gap-2 text-xs text-slate-500"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-0.5" />I agree to receive GiftGrid updates.</label>{message && <p className="mt-2 text-xs text-slate-400">{message}</p>}</form><div><label className="mb-1 block text-xs font-semibold text-slate-400">Language</label><select value={language} onChange={(event) => changeLanguage(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none"><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option><option value="de">Deutsch</option><option value="pt">Português</option></select></div></div>
    <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row"><p className="text-xs text-slate-500">© {new Date().getFullYear()} GiftGrid. All rights reserved. E-commerce merchant readiness &amp; corporate gifting.</p><div className="flex items-center gap-4"><a href={COMMUNITY_URL} className="text-xs text-slate-500 hover:text-slate-300">community.degiftgrid.com</a><a href="/console" className="text-xs text-emerald-500 hover:text-emerald-400">developers</a></div></div>
  </div></footer>;
}
