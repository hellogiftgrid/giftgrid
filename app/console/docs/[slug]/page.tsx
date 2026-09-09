import Link from "next/link";
import { notFound } from "next/navigation";
import { developerDocs, getDeveloperDoc } from "@/lib/docs/developer-docs";

export function generateStaticParams() { return developerDocs.map(([slug]) => ({ slug })); }

export default async function DeveloperDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDeveloperDoc(slug);
  if (!doc) notFound();
  const [, title, description] = doc;
  return <article className="mx-auto max-w-4xl"><Link href="/console/docs" className="text-sm text-indigo-300 hover:text-indigo-200">← All docs</Link><p className="mt-10 text-xs font-bold uppercase tracking-[.2em] text-indigo-300">GiftGrid developer docs</p><h1 className="mt-3 text-4xl font-bold">{title}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">{description}</p><div className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/[.04] p-7 text-sm leading-7 text-slate-300"><p>Use this guide when building a GiftGrid integration. Keep credentials on your server, request only the permissions your app needs, and treat all webhook and user-provided content as untrusted input.</p><p>Start in the sandbox, log request IDs, and make writes idempotent. Production access is reviewed against your app status, scopes, error handling, and data practices.</p><pre className="overflow-x-auto rounded-xl bg-slate-950 p-5 text-xs text-indigo-200"><code>{`curl https://www.degiftgrid.com/api/v1/${slug}\n  -H "Authorization: Bearer $GIFTGRID_API_KEY"\n  -H "Content-Type: application/json"`}</code></pre><p>For account-specific access, use the console controls or contact the GiftGrid administrator. Never place API keys in browser bundles, mobile source code, screenshots, or public repositories.</p></div></article>;
}
