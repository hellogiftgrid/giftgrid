"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "auto";
type AppliedTheme = Exclude<ThemeMode, "auto">;

function getMode(): ThemeMode {
  const saved = window.localStorage.getItem("giftgrid-theme");
  return saved === "dark" || saved === "light" || saved === "auto" ? saved : "auto";
}

function themeForLocalTime(): AppliedTheme {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
}

function applyTheme(mode: ThemeMode): AppliedTheme {
  const theme = mode === "auto" ? themeForLocalTime() : mode;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  return theme;
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [theme, setTheme] = useState<AppliedTheme>("light");

  useEffect(() => {
    const current = getMode();
    setMode(current);
    setTheme(applyTheme(current));
  }, []);

  useEffect(() => {
    if (mode !== "auto") return;
    const refreshAutomaticTheme = () => {
      setTheme(applyTheme("auto"));
    };
    const interval = window.setInterval(refreshAutomaticTheme, 60_000);
    window.addEventListener("focus", refreshAutomaticTheme);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshAutomaticTheme);
    };
  }, [mode]);

  function toggleTheme() {
    const next: ThemeMode = mode === "light" ? "dark" : mode === "dark" ? "auto" : "light";
    setMode(next);
    setTheme(applyTheme(next));
    window.localStorage.setItem("giftgrid-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Theme mode: ${mode}. Click to switch.`}
      title="Click to cycle Light, Dark, and Auto"
      className="theme-toggle inline-flex h-10 min-w-[76px] items-center justify-center rounded-full border border-slate-200 bg-white/90 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
    >
      {mode === "auto" ? `Auto (${theme})` : mode}
    </button>
  );
}
