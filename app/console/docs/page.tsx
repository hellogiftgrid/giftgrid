import Link from "next/link";
import { developerDocs } from "@/lib/docs/developer-docs";

export default function DeveloperDocsIndex() {
  return <div className="mx-auto max-w-5xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-300">GiftGrid developer docs</p><h1 className="mt-3 text-4xl font-bold">Build with GiftGrid</h1><p className="mt-4 max-w-2xl leading-7 text-slate-400">Twenty practical guides for building secure apps, marketplace workflows, community tools, and AI-moderated automations.</p><div className="mt-10 grid gap-3 sm:grid-cols-2">{developerDocs.map(([slug,title,description], index) => <Link key={slug} href={`/console/docs/${slug}`} className="rounded-xl border border-white/10 bg-white/[.04] p-5 hover:border-indigo-300/50"><span className="text-xs font-mono text-indigo-300">{String(index + 1).padStart(2, "0")}</span><h2 className="mt-2 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></Link>)}</div></div>;
}
