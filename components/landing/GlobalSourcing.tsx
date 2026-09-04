export default function GlobalSourcing() {
  return (
    <section className="border-b border-borderCustom bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
              Global Sourcing &amp; Fulfillment
            </span>
            <h2 className="mt-4 font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.1] tracking-tight text-balance">
              Reach Teams Globally with Seamless Sourcing &amp; Fulfillment
            </h2>
            <p className="mt-5 max-w-[480px] text-[16px] leading-relaxed text-textSecondary">
              Position your store to serve buyers wherever they are — with sourcing,
              warehousing, and fulfillment built for scale across regions and channels.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-borderCustom shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/global-fulfillment.png"
              alt="Modern fulfillment warehouse with stocked shelving"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Swag & Direct Mail */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 overflow-hidden rounded-2xl border border-borderCustom shadow-lg lg:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/swag-direct-mail.png"
              alt="Branded corporate swag: boxes, apparel, and stationery"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
              Swag &amp; Direct Mail
            </span>
            <h2 className="mt-4 font-display text-[clamp(24px,3vw,36px)] font-semibold leading-[1.1] tracking-tight text-balance">
              Branded merchandise, packaged and delivered
            </h2>
            <p className="mt-5 max-w-[480px] text-[16px] leading-relaxed text-textSecondary">
              From branded boxes and apparel to printed stationery, prepare the kind of
              polished, gift-ready products corporate buyers expect.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
