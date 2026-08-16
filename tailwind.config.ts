import type { Config } from "tailwindcss";
import { colors, fonts } from "./config/branding";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors,
      fontFamily: fonts,
      keyframes: {
        driftGrid: {
          "0%": { backgroundPosition: "0 0, 0 0" },
          "100%": { backgroundPosition: "56px 112px, 112px 56px" },
        },
        scrollMarquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        flowDash: {
          "100%": { strokeDashoffset: "-24" },
        },
      },
      animation: {
        driftGrid: "driftGrid 22s linear infinite",
        scrollMarquee: "scrollMarquee 34s linear infinite",
        flowDash: "flowDash 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
