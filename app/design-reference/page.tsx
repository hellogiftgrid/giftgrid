import Image from "next/image";

const slices = [
  ["01-hero.png", "Hero"],
  ["02-trust-integrations.png", "Trust & Integrations"],
  ["03-team-collaboration.png", "Team Collaboration"],
  ["04-sourcing-fulfillment.png", "Sourcing & Fulfillment"],
  ["05-opportunity-network.png", "Opportunity Network"],
  ["06-campaign-roi.png", "Campaign & ROI"],
  ["07-real-reviews.png", "Real Reviews"],
  ["08-employee-recognition.png", "Employee Recognition"],
  ["09-footer.png", "Footer — CTA + Footer"],
];

export const metadata = {
  title: "GiftGrid Landing Page Design Reference",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DesignReferencePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            GiftGrid Design Reference
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Landing Page Reference Preview
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Protected visual reference and section breakdown used to rebuild
            the GiftGrid landing page as real responsive interactive UI.
          </p>
        </header>

        <section className="mb-12 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="mb-5">
            <h2 className="text-2xl font-black">
              Full Master Reference
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              480 × 2192 — untouched reference.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <Image
              src="/design-reference/landing-reference.png"
              alt="GiftGrid landing page master reference"
              width={480}
              height={2192}
              priority
              className="mx-auto h-auto w-full max-w-[480px]"
            />
          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black">
              Section References
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              CTA and footer are intentionally treated as one final footer
              section.
            </p>
          </div>

          <div className="space-y-10">
            {slices.map(([file, title]) => (
              <article
                key={file}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {file}
                  </p>
                </div>

                <div className="bg-slate-50 p-4">
                  <Image
                    src={`/design-reference/slices/${file}`}
                    alt={`${title} reference`}
                    width={480}
                    height={900}
                    className="mx-auto h-auto w-full max-w-[900px]"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
