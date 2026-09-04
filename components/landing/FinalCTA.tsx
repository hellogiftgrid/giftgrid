import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="hero-blob-bg py-24 lg:py-32">
      <div className="mx-auto max-w-[720px] px-7 text-center">
        <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
          Get to Position
        </span>
        <h2 className="mt-5 font-display text-[clamp(30px,4.4vw,50px)] font-semibold leading-[1.08] tracking-tight text-balance">
          Ready to position your brand for the right opportunities?
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed text-textSecondary">
          Talk to our team about how to best prepare and position your store.
          Booking a call is talking directly with one of us.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-primary shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Apply as a Merchant
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center rounded-full border border-borderCustom bg-primary px-7 py-3.5 text-[15px] font-semibold text-textPrimary transition-colors hover:border-accent hover:text-accent"
          >
            Book a Call
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-borderCustom bg-primary px-7 py-3.5 text-[15px] font-semibold text-textPrimary transition-colors hover:border-accent hover:text-accent"
          >
            Talk to Our Team
          </Link>
        </div>
      </div>
    </section>
  );
}
