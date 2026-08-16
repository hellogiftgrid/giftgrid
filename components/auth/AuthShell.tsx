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
    <div className="flex min-h-screen items-center justify-center bg-primary px-6 py-16">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="mb-10 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-horizontal.png" alt="GiftGrid" className="h-10 w-auto object-contain" />
        </Link>

        <div className="rounded-md border border-borderCustom bg-secondary p-8">
          <h1 className="font-display text-[24px] font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-[14px] text-textSecondary">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-[14px] text-textSecondary">{footer}</div>}
      </div>
    </div>
  );
}
