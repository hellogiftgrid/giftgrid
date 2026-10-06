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
      className="theme-toggle inline-flex h-10 min-w-0 items-center justify-center rounded-full border border-slate-200 bg-white/90 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
    >
      {mode === "light" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"/></svg>}
      {mode === "dark" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
      {mode === "auto" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><circle cx="12" cy="12" r="9"/><path d="M12 3v18" fill="currentColor" opacity=".35"/></svg>}
    </button>
  );
}
