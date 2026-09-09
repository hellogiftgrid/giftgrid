"use client";

import Link from "next/link";
import type { SiteSection } from "@/lib/content/site-sections";
import { useEffect, useState, type CSSProperties } from "react";

export default function DynamicSiteSections({ sections }: { sections: SiteSection[] }) {
  const [items, setItems] = useState(sections);
  useEffect(() => {
    const receive = (event: Event) => setItems((event as CustomEvent<SiteSection[]>).detail);
    window.addEventListener("giftgrid:preview-sections", receive);
    return () => window.removeEventListener("giftgrid:preview-sections", receive);
  }, []);
  return <>{items.filter((section) => section.visible).map((section) => {
    const sizing = { "--section-width": `${section.contentWidth || 1280}px`, "--section-desktop-height": `${section.desktopHeight || 0}px`, "--section-mobile-height": `${section.mobileHeight || 0}px`, "--section-image-height": `${section.imageHeight || 380}px`, "--section-title-size": `${section.titleSize || 48}px`, "--section-text-size": `${section.textSize || 18}px` } as CSSProperties;
    if (section.type === "announcement") return null;
    if (section.type === "spacer") return <div key={section.id} aria-hidden="true" style={{ height: section.height || 64 }} />;
    if (section.type === "text") return <section key={section.id} className="dynamic-section site-section" style={{ ...sizing, background: section.background, color: section.color, paddingBlock: section.padding }}><div className={`dynamic-section-inner mx-auto px-5 sm:px-10 ${section.align === "center" ? "text-center" : "text-left"}`}>{section.eyebrow && <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">{section.eyebrow}</p>}<h2 className="dynamic-section-title mt-3 font-bold">{section.title}</h2><p className="dynamic-section-copy mt-5 whitespace-pre-line leading-8">{section.body}</p></div></section>;
    if (section.type === "image_text") return <section key={section.id} className="dynamic-section site-section" style={{ ...sizing, background: section.background, color: section.color, paddingBlock: section.padding }}><div className="dynamic-section-inner mx-auto grid items-center gap-10 px-5 sm:px-10 lg:grid-cols-2"><div className={`dynamic-section-image relative overflow-hidden rounded-[var(--site-card-radius)] ${section.imagePosition === "right" ? "lg:order-2" : ""}`}>{section.imageUrl ? <img src={section.imageUrl} alt="" className="absolute inset-0 size-full object-cover" /> : <div className="absolute inset-0 grid place-items-center bg-slate-100 text-sm text-slate-400">Image placeholder</div>}</div><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">{section.eyebrow}</p><h2 className="dynamic-section-title mt-3 font-bold">{section.title}</h2><p className="dynamic-section-copy mt-5 whitespace-pre-line leading-8">{section.body}</p>{section.buttonLabel && <Link href={section.buttonUrl || "#"} className="site-button site-accent-bg mt-7 inline-flex items-center px-6 py-3 text-sm font-bold text-white">{section.buttonLabel}</Link>}</div></div></section>;
    if (section.type === "gallery") { const images = section.items?.filter(Boolean) || []; return <section key={section.id} className="site-section"><div className="mx-auto max-w-7xl px-5 sm:px-10"><h2 className="text-3xl font-bold sm:text-5xl">{section.title}</h2><p className="mt-3 text-lg">{section.body}</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{images.map((src, index) => <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[var(--site-card-radius)]"><img src={src} alt="" className="absolute inset-0 size-full object-cover" /></div>)}</div></div></section>; }
    return null;
  })}</>;
}
