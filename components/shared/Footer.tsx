import Link from "next/link";
import { siteConfig } from "@/config/branding";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/how-it-works", label: "How It Works" },
      { href: "/store-review", label: "Store Review" },
      { href: "/#network", label: "Opportunity Network" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" },
      { href: "/cookies", label: "Cookie Policy" },
    ],
  },
];

// Footer intentionally inverts to a dark band for contrast against the
// light site — footerBg/footerText tokens live in config/branding.ts.
export default function Footer() {
  return (
    <footer className="border-t border-footerBorder bg-footerBg">
      <div className="mx-auto max-w-[1180px] px-7 pb-8 pt-16">
        <div className="mb-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            {/* The source file has a white background, not transparent — the white
                pill keeps it looking intentional on the dark footer instead of a
                broken box. Swap for a transparent PNG when you have one. */}
            <div className="inline-block rounded-lg bg-white px-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-horizontal.jpeg" alt="GiftGrid" className="h-7 w-auto object-contain" />
            </div>
            <p className="mt-3.5 max-w-[280px] text-[14px] leading-relaxed text-footerTextSecondary">
              {siteConfig.tagline} {siteConfig.description}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-mono text-[11.5px] uppercase tracking-widest text-footerTextSecondary">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[14px] text-footerText/85 hover:text-accentAlt">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-footerBorder pt-6 text-[13px] text-footerTextSecondary">
          <span>© {new Date().getFullYear()} {siteConfig.name}. Built for e-commerce brands.</span>
          <span>{siteConfig.supportEmail}</span>
        </div>
      </div>
    </footer>
  );
}
