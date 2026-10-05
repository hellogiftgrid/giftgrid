"use client";
import Link from 'next/link';
export default function CommunityError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto max-w-xl p-6 py-16"><div role="alert" className="rounded-2xl border border-slate-200 bg-white p-8"><h1 className="text-2xl font-bold text-slate-950">We couldn&apos;t load this community page.</h1><p className="mt-4 text-sm leading-7 text-slate-600">Please try again. If this keeps happening, contact support with the page address and what you were doing.</p><button onClick={reset} className="mt-6 min-h-12 rounded-xl bg-blue-600 px-5 font-bold text-white">Try again</button><Link href="/contact" className="ml-5 inline-block py-3 text-sm text-blue-600 underline">Get help</Link></div></main>;
}
