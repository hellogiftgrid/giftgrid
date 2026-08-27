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
    const target = document.getElementById("giftgrid-calendly");
    if (!target || !url) return;

    const initialise = () => {
      if (!window.Calendly) return;

      target.innerHTML = "";

      window.Calendly.initInlineWidget({
        url,
        parentElement: target,
        resize: true,
      });
    };

    if (window.Calendly) {
      initialise();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = initialise;

    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [url]);

  return (
    <div
      id="giftgrid-calendly"
      style={{
        width: "100%",
        minWidth: "320px",
        minHeight: "760px",
      }}
    />
  );
}
