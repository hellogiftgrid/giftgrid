"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Cal?: any;
  }
}

export default function CalBooking() {
  useEffect(() => {
    const C = window as any;
    const A = "https://app.cal.com/embed/embed.js";
    const L = "init";

    const p = (a: any, ar: any[]) => {
      a.q = a.q || [];
      a.q.push(ar);
    };

    C.Cal =
      C.Cal ||
      function (...args: any[]) {
        const cal = C.Cal;
        const ar = args;

        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];

          const d = document;
          const script = d.createElement("script");
          script.src = A;
          script.async = true;
          d.head.appendChild(script);

          cal.loaded = true;
        }

        if (ar[0] === L) {
          const api = function (...apiArgs: any[]) {
            p(api, apiArgs);
          };

          const namespace = ar[1];

          api.q = api.q || [];

          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else {
            p(cal, ar);
          }

          return;
        }

        p(cal, ar);
      };

    C.Cal("init", "gift-grid-30-min-call", {
      origin: "https://app.cal.com",
    });

    C.Cal.config = C.Cal.config || {};
    C.Cal.config.forwardQueryParams = true;

    C.Cal.ns["gift-grid-30-min-call"]("inline", {
      elementOrSelector: "#my-cal-inline-gift-grid-30-min-call",
      config: {
        layout: "month_view",
        useSlotsViewOnSmallScreen: "true",
        theme: "auto",
      },
      calLink: "degiftgrid/gift-grid-30-min-call",
    });

    C.Cal.ns["gift-grid-30-min-call"]("ui", {
      cssVarsPerTheme: {
        light: {
          "cal-brand": "#23348d",
        },
      },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        id="my-cal-inline-gift-grid-30-min-call"
        className="min-h-[720px] w-full"
      />
    </div>
  );
}
