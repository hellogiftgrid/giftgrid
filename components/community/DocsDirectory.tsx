"use client";
import Link from 'next/link';
import { useState } from 'react';

type Entry = { slug: string; title: string; summary: string; category: string; wordCount: number };
export default function DocsDirectory({ guides }: { guides: Entry[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All topics');
  const categories = [...new Set(guides.map(guide => guide.category))];
  const visible = guides.filter(guide => (category === 'All topics' || guide.category === category) && `${guide.title} ${guide.summary} ${guide.category}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="mt-8">
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[minmax(0,1fr)_220px]">
      <label className="text-sm font-semibold text-slate-700">Search the docs<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Try listings, likes or CLI" className="mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-normal" /></label>
      <label className="text-sm font-semibold text-slate-700">Browse by topic<select value={category} onChange={event => setCategory(event.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"><option>All topics</option>{categories.map(name => <option key={name}>{name}</option>)}</select></label>
    </div>
    <p aria-live="polite" className="my-5 text-sm text-slate-500">{visible.length} {visible.length === 1 ? 'guide' : 'guides'}{search && ` matching “${search}”`}</p>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map(guide => <Link key={guide.slug} href={`/docs/${guide.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-600">{guide.category}</p><h2 className="mt-3 text-lg font-bold text-slate-950 group-hover:text-blue-700">{guide.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{guide.summary}</p><p className="mt-5 text-xs font-medium text-slate-500">{Math.ceil(guide.wordCount / 220)} min read</p>
    </Link>)}</div>
    {!visible.length && <div className="rounded-2xl border border-slate-200 bg-white p-8"><p className="text-slate-700">No guides match these filters.</p><button type="button" onClick={() => { setSearch(''); setCategory('All topics'); }} className="mt-3 min-h-11 font-bold text-blue-700 underline">Clear filters</button></div>}
  </div>;
}
