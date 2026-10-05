import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedGuide, publishedGuides } from '@/lib/docs/library';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return publishedGuides.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getPublishedGuide((await params).slug);
  if (!guide) return { title: 'Guide not found' };
  return { title: guide.title, description: guide.summary, alternates: { canonical: `https://community.degiftgrid.com/docs/${guide.slug}` }, openGraph: { title: guide.title, description: guide.summary, url: `https://community.degiftgrid.com/docs/${guide.slug}`, type: 'article' } };
}
export default async function GuidePage({ params }: Props) {
  const guide = getPublishedGuide((await params).slug);
  if (!guide) notFound();
  const related = publishedGuides.filter(other => other.category === guide.category && other.slug !== guide.slug).slice(0, 4);
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600"><Link href="/docs" className="font-semibold text-blue-600 underline">Docs</Link><span aria-hidden="true"> / </span><span>{guide.category}</span></nav>
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_230px]"><article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 sm:p-10"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">{guide.category}</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{guide.title}</h1><p className="mt-4 text-lg leading-8 text-slate-600">{guide.summary}</p><p className="mt-4 text-xs text-slate-500">{Math.ceil(guide.wordCount / 220)} min read · {guide.wordCount.toLocaleString('en-GB')} words</p>
      <p className="mt-8 whitespace-pre-line break-words text-base leading-8 text-slate-700">{guide.intro}</p>
      <nav aria-label="On this page" className="my-8 rounded-xl border border-slate-200 bg-slate-50 p-5"><h2 className="font-bold text-slate-950">On this page</h2><ol className="mt-3 space-y-2">{guide.sections.map((section, index) => <li key={index}><a href={`#section-${index + 1}`} className="text-sm leading-6 text-blue-600 underline">{section.heading}</a></li>)}</ol></nav>
      {guide.sections.map((section, index) => <section key={index} id={`section-${index + 1}`} className="mt-10 scroll-mt-28"><h2 className="text-2xl font-bold text-slate-950">{section.heading}</h2>{section.paragraphs.map((paragraph, i) => <p key={i} className="mt-4 whitespace-pre-line break-words text-base leading-8 text-slate-700">{paragraph}</p>)}</section>)}
      <div className="mt-10 border-t border-slate-200 pt-6"><Link href={guide.destination} className="inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Open {guide.category === 'CLI' || guide.category === 'Developer reference' ? 'the developer console' : guide.category === 'Help' ? 'support' : 'this workspace'}</Link><p className="mt-3 text-sm leading-6 text-slate-500">Need help with a specific error? <Link href="/contact" className="text-blue-600 underline">Contact GiftGrid</Link> with the page and visible error, without passwords or secret keys.</p></div>
    </article><aside className="rounded-2xl border border-slate-200 bg-white p-5 xl:sticky xl:top-28"><h2 className="font-bold text-slate-950">Keep learning</h2><ul className="mt-4 space-y-4">{related.map(other => <li key={other.slug}><Link href={`/docs/${other.slug}`} className="text-sm leading-6 text-blue-600 underline">{other.title}</Link></li>)}</ul><Link href="/docs" className="mt-6 inline-block text-sm font-bold text-slate-700">Browse all docs</Link></aside></div>
  </main>;
}
