"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        resize?: boolean;
      }) => void;
    };
  }
}

export default function CalendlyEmbed({
  url,
}: {
  url: string;
}) {
  useEffect(() => {
    function initialize() {
      const target =
        document.getElementById("giftgrid-calendly");

      if (!target || !window.Calendly) return;

      target.innerHTML = "";

      window.Calendly.initInlineWidget({
        url,
        parentElement: target,
        resize: true,
      });
    }

    if (window.Calendly) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;

    script.onload = initialize;

    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [url]);

  return (
    <div
      id="giftgrid-calendly"
      style={{
        minWidth: "320px",
        height: "760px",
        overflow: "hidden",
      }}
    />
  );
}
