import { supportedPlatforms } from "@/config/branding";

export default function PlatformStrip() {
  return (
    <section className="border-b border-borderCustom bg-secondary py-12">
      <div className="mx-auto max-w-[1180px] px-7">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-textSecondary">
          Supports every major e-commerce platform
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {supportedPlatforms.map((platform) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={platform.name}
              src={`/images/platforms/${platform.slug}`}
              alt={platform.name}
              className="h-8 w-auto object-contain opacity-90 grayscale transition hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
