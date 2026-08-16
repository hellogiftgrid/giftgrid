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

export default function Footer() {
  return (
    <footer className="border-t border-borderCustom bg-secondarySoft">
      <div className="mx-auto max-w-[1180px] px-7 pb-8 pt-16">
        <div className="mb-13 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 font-display text-[21px] font-semibold">
              <span className="h-[7px] w-[7px] rounded-full bg-accent" />
              {siteConfig.name}
            </div>
            <p className="mt-3.5 max-w-[280px] text-[14px] leading-relaxed text-textSecondary">
              {siteConfig.tagline} {siteConfig.description}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-mono text-[11.5px] uppercase tracking-widest text-textSecondary">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[14px] text-textPrimary/85 hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-borderCustom pt-6 text-[13px] text-textSecondary">
          <span>© {new Date().getFullYear()} {siteConfig.name}. Built for e-commerce brands.</span>
          <span>{siteConfig.supportEmail}</span>
        </div>
      </div>
    </footer>
  );
}
