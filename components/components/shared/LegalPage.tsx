import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>
        <section className="border-b border-borderCustom py-24">
          <div className="mx-auto max-w-[760px] px-7">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">Legal</span>
            <h1 className="mt-5 font-display text-[clamp(30px,4.5vw,46px)] font-semibold leading-[1.1] tracking-tight">
              {title}
            </h1>
            <p className="mt-4 text-[13.5px] text-textSecondary">Last updated: {updated}</p>

            <div className="prose-legal mt-10 space-y-7 text-[15px] leading-relaxed text-textSecondary [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:text-textPrimary [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
              {children}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
