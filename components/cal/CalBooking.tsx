"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Cal?: any;
  }
}

export default function CalBooking() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const scriptSrc = "https://app.cal.com/embed/embed.js";

    const initialize = () => {
      if (!window.Cal) {
        console.error("Cal.com embed failed to load.");
        return;
      }

      window.Cal("init", "gift-grid-booking", {
        origin: "https://app.cal.com",
      });

      window.Cal.config =
        window.Cal.config || {};

      window.Cal.config.forwardQueryParams = true;

      window.Cal.ns["gift-grid-booking"](
        "inline",
        {
          elementOrSelector: "#gift-grid-cal-booking",
          config: {
            layout: "month_view",
            useSlotsViewOnSmallScreen: "true",
            hideEventTypeDetails: "true",
            theme: "light",
          },
          calLink: "degiftgrid/gift-grid-30-min-call",
        }
      );

      window.Cal.ns["gift-grid-booking"](
        "ui",
        {
          theme: "light",
          hideEventTypeDetails: true,
          styles: {
            branding: {
              brandColor: "#4F46E5",
            },
          },
        }
      );
    };

    const existing = document.querySelector(
      `script[src="${scriptSrc}"]`
    );

    if (existing) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = initialize;
    script.onerror = () => {
      console.error("Unable to load Cal.com embed.");
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div
        id="gift-grid-cal-booking"
        className="min-h-[760px] w-full"
      />
    </div>
  );
}
