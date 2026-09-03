"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Cal?: any;
  }
}

export default function CalBooking() {
  useEffect(() => {
    const initCal = () => {
      if (!window.Cal) return;

      window.Cal("init", "gift-grid-30-min-call", {
        origin: "https://app.cal.com",
      });

      window.Cal.config = window.Cal.config || {};
      window.Cal.config.forwardQueryParams = true;

      window.Cal.ns["gift-grid-30-min-call"]("inline", {
        elementOrSelector: "#my-cal-inline-gift-grid-30-min-call",
        config: {
          layout: "month_view",
          useSlotsViewOnSmallScreen: "true",
          theme: "auto",
        },
        calLink: "degiftgrid/gift-grid-30-min-call",
      });

      window.Cal.ns["gift-grid-30-min-call"]("ui", {
        cssVarsPerTheme: {
          light: {
            "cal-brand": "#23348d",
          },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    };

    if (window.Cal?.loaded) {
      initCal();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    script.onload = initCal;

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  return (
    <div
      id="my-cal-inline-gift-grid-30-min-call"
      style={{
        width: "100%",
        minHeight: "720px",
        overflow: "hidden",
      }}
    />
  );
}
