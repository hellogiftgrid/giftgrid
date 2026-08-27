import Link from "next/link";

const productLinks = [
  { href: "/store-review", label: "Store Review" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/blog", label: "GiftGrid Blog" },
];

const companyLinks = [
  { href: "/giftgrid", label: "About GiftGrid" },
  { href: "/about", label: "Our Company" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">

        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          <div>
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="GiftGrid home"
            >
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white shadow-sm">
                <img
                  src="/images/logo-full.png"
                  alt="GiftGrid"
                  className="h-10 w-10 object-contain"
                />
              </span>
            </Link>

            <h2 className="mt-5 text-2xl font-bold">
              GiftGrid
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-7 text-slate-300">
              The e-commerce merchant platform helping brands audit
              their stores, improve buyer readiness, and prepare for
              corporate gifting, wholesale, and commercial opportunities.
            </p>

            <a
              href="mailto:support@degiftgrid.com"
              className="mt-5 inline-flex text-sm font-semibold text-white transition hover:text-indigo-300"
            >
              support@degiftgrid.com
            </a>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Product
            </h3>

            <nav className="mt-5 space-y-3">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-slate-300 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Company
            </h3>

            <nav className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-slate-300 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Legal
            </h3>

            <nav className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-slate-300 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2019 GiftGrid. All rights reserved.
          </p>

          <p>
            E-commerce merchant readiness & corporate gifting.
          </p>
        </div>

      </div>
    </footer>
  );
}
