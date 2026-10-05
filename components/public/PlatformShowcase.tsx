"use client";

import Link from "next/link";
import { useState } from "react";

const views = {
  merchants: {
    eyebrow: "For merchants",
    title: "Get your brand ready for serious buyers.",
    copy: "Complete your readiness review, strengthen your profile, and manage every buyer opportunity from one workspace.",
    href: "/auth/sign-up",
    action: "Apply as a merchant",
    metrics: [["Readiness", "82%"], ["Live opportunities", "12"], ["Buyer connections", "4"]],
    activity: ["Brand profile approved", "Holiday gifting match", "Buyer requested samples"],
  },
  buyers: {
    eyebrow: "For gifting teams",
    title: "Source memorable gifts without the noise.",
    copy: "Tell us what you need and discover reviewed, order-ready brands suited to your audience, quantity, and timeline.",
    href: "/buyers/apply",
    action: "Start a sourcing request",
    metrics: [["Qualified brands", "140+"], ["Active briefs", "8"], ["Shortlisted", "16"]],
    activity: ["Brief received", "Brands matched to criteria", "Introduction ready"],
  },
  teams: {
    eyebrow: "For your team",
    title: "Keep every opportunity moving together.",
    copy: "Bring recommendations, applications, documents, conversations, and next actions into one clear team workflow.",
    href: "/contact",
    action: "Contact GiftGrid",
    metrics: [["Tasks completed", "28"], ["In review", "5"], ["Team members", "6"]],
    activity: ["Packaging document uploaded", "Application assigned", "Follow-up scheduled"],
  },
} as const;

type ViewKey = keyof typeof views;

export default function PlatformShowcase() {
  const [active, setActive] = useState<ViewKey>("merchants");
  const view = views[active];

  return (
    <section className="bg-[#f4f5f8] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[.14em] text-blue-700">One connected platform</span>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-.04em] text-slate-950 sm:text-5xl">Built for both sides of better gifting.</h2>
        </div>

        <div className="mx-auto mt-10 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
          {(Object.keys(views) as ViewKey[]).map((key) => (
            <button key={key} type="button" onClick={() => setActive(key)} className={`whitespace-nowrap px-5 py-2.5 text-sm font-semibold transition ${active === key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
              {key === "merchants" ? "Merchants" : key === "buyers" ? "Gifting teams" : "Teams"}
            </button>
          ))}
        </div>

        <div className="mt-8 grid overflow-hidden rounded-[28px] border-[10px] border-white bg-white shadow-[0_18px_60px_rgba(15,23,42,.08)] lg:grid-cols-[.82fr_1.18fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="text-sm font-semibold text-blue-600">{view.eyebrow}</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-[-.035em] text-slate-950 sm:text-4xl">{view.title}</h3>
            <p className="mt-5 text-base leading-7 text-slate-600">{view.copy}</p>
            <Link href={view.href} className="mt-8 inline-flex w-fit items-center bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">{view.action} →</Link>
          </div>

          <div className="bg-slate-950 p-4 sm:p-7">
            <div className="rounded-[20px] border border-slate-800 bg-slate-900 p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div><p className="text-xs text-slate-500">GiftGrid workspace</p><p className="mt-1 font-semibold text-white">Overview</p></div>
                <span className="h-9 w-9 rounded-full bg-blue-600" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {view.metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-3 text-2xl font-semibold text-white">{value}</p></div>)}
              </div>
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Recent activity</p>
                <div className="mt-4 space-y-3">{view.activity.map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-slate-200"><span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-blue-400" : "bg-slate-600"}`} />{item}<span className="ml-auto text-xs text-slate-600">{index + 1}d</span></div>)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
