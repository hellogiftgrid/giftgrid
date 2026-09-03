"use client";

import Script from "next/script";

declare global {
  interface Window {
    Cal?: any;
  }
}

export default function CalBooking() {
  return (
    <>
      <Script
        src="https://app.cal.com/embed/embed.js"
        strategy="afterInteractive"
      />

      <button
        type="button"
        data-cal-link="degiftgrid/gift-grid-30-min-call"
        data-cal-config='{"layout":"month_view"}'
        className="inline-flex items-center justify-center rounded-xl bg-[#4F46E5] px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-100"
      >
        Book a Call →
      </button>
    </>
  );
}
