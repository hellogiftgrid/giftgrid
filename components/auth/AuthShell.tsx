import Image from "next/image";
import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f5f8] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-6xl overflow-hidden rounded-[32px] border-[8px] border-white bg-white shadow-[0_24px_80px_rgba(15,23,42,.10)] lg:grid-cols-[1.05fr_.95fr]">
        <aside className="relative hidden overflow-hidden bg-blue-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Image src="/images/heroes/gifting.webp" alt="" fill sizes="50vw" className="object-cover" /><div className="absolute inset-0 bg-slate-950/65" />
          <Link href="/" className="relative z-10 w-fit rounded-full bg-white px-5 py-3">
            <img src="/images/logo-horizontal.png" alt="GiftGrid" className="theme-logo h-8 w-auto object-contain" />
          </Link>
          <div className="relative z-10 max-w-md">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-200">Your GiftGrid workspace</p>
            <h2 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-.045em]">Better gifting starts with better connections.</h2>
            <p className="mt-5 text-lg leading-8 text-blue-100">Prepare your brand, manage opportunities, and build genuine relationships with gifting teams.</p>
            <div className="mt-8 flex gap-5 text-sm text-blue-100"><span>For buyers</span><span>For merchants</span></div>
          </div>
        </aside>

        <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-[420px]">
        <Link href="/" className="mb-9 flex items-center justify-center lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-horizontal.png" alt="GiftGrid" className="theme-logo h-10 w-auto object-contain" />
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Welcome to GiftGrid</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.035em] text-slate-950">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] leading-6 text-slate-500">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-[14px] text-textSecondary">{footer}</div>}
          <div className="mt-8 flex justify-center gap-5 text-xs text-slate-500"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="https://community.degiftgrid.com/docs">Help centre</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}
