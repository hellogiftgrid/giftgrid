"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function PwaInstallButton() {
  const [promptEvent, setPromptEvent] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onPrompt = (event: Event) => { event.preventDefault(); setPromptEvent(event as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setPromptEvent(null); setMessage("GiftGrid has been added to your home screen."); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  async function install() {
    if (!promptEvent) {
      setMessage("On Android, open this page in Chrome, tap ⋮, then choose Install app or Add to Home screen.");
      return;
    }
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "dismissed") setMessage("You can install GiftGrid later from your browser menu.");
    setPromptEvent(null);
  }

  return <div><button type="button" onClick={install} disabled={installed} className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-emerald-700">{installed ? "GiftGrid is installed" : "Install GiftGrid on this phone"}</button>{message && <p role="status" className="mt-3 max-w-lg rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{message}</p>}</div>;
}
