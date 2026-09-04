export default function EmployeeRecognition() {
  return (
    <section className="border-b border-borderCustom bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
              Culture
            </span>
            <h2 className="mt-4 font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.1] tracking-tight text-balance">
              Ongoing Employee Recognition
            </h2>
            <p className="mt-5 max-w-[480px] text-[16px] leading-relaxed text-textSecondary">
              Foster a culture of appreciation with ongoing recognition and rewards —
              the kind of programs corporate gifting buyers are looking to power.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-borderCustom shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/employee-recognition.png"
              alt="Diverse group of employees celebrating together"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-borderCustom bg-primary/95 p-3.5 shadow-md backdrop-blur">
              <p className="text-[13px] font-semibold text-textPrimary">
                Sarah K. received a $150 coffee voucher
              </p>
              <p className="mt-0.5 text-[12px] text-textSecondary">
                Recognized for outstanding teamwork
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
