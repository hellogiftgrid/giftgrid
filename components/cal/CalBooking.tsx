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

    const src = "https://app.cal.com/embed/embed.js";

    const initialize = () => {
      if (!window.Cal) {
        console.error("GiftGrid: Cal.com failed to load");
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
          calLink: "degiftgrid/gift-grid-30-min-call",
          config: {
            layout: "month_view",
            useSlotsViewOnSmallScreen: "true",
          },
        }
      );

      window.Cal.ns["gift-grid-booking"](
        "ui",
        {
          theme: "light",
          hideEventTypeDetails: false,
          layout: "month_view",
          styles: {
            branding: {
              brandColor: "#4F46E5",
            },
          },
        }
      );
    };

    const existing = document.querySelector(
      `script[src="${src}"]`
    );

    if (existing) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = initialize;

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div
        id="gift-grid-cal-booking"
        style={{
          width: "100%",
          minHeight: "760px",
        }}
      />
    </div>
  );
}
