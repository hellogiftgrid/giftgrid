'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { supportedPlatforms } from '@/config/branding';
import { useSitePages } from './SitePagesProvider';
import { type PageBlock } from '@/lib/content/site-pages';
import HeroVideo from './HeroVideo';

const auditLanguage = /store\s+(audit|review)|audit\s+(your|their|the)\s+store|review\s+(your|their|the)\s+store|readiness\s+score/i;

function containsAuditLanguage(value: unknown) {
 return typeof value === 'string' && auditLanguage.test(value);
}

function removeAuditContent(block: PageBlock): PageBlock | null {
 if (containsAuditLanguage(block.title) || containsAuditLanguage(block.eyebrow) || containsAuditLanguage(block.body)) return null;
 const cards = block.cards?.filter((card) => !containsAuditLanguage(card.title) && !containsAuditLanguage(card.body));
 return cards ? { ...block, cards } : block;
}

export default function PageSections({path}:{path:string}) {
 const pages=useSitePages();const blocks=(pages[path]||[]).map(removeAuditContent).filter((block): block is PageBlock => block !== null);
 return <>{blocks.filter(b=>b.visible).map(block=><PageSection key={block.id} block={block} path={path}/>)}</>;
}
export function PageSection({block:b,path}:{block:PageBlock;path?:string}) {
 const [editing,setEditing]=useState(false);
 useEffect(()=>{setEditing(window.parent!==window&&new URLSearchParams(location.search).has('design-preview'));},[]);
 const style={'--block-padding':`${b.padding??80}px`,backgroundColor:b.background,color:b.color} as CSSProperties;
 const actions=<div className={`mt-8 flex flex-wrap gap-3 ${b.align==='center'?'justify-center':''}`}>{b.buttonLabel&&b.buttonUrl&&<Link className="site-button site-accent-bg inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-110" href={b.buttonUrl}>{b.buttonLabel} <span aria-hidden="true" className="ml-3">↗</span></Link>}{b.secondaryLabel&&b.secondaryUrl&&<Link className="inline-flex items-center justify-center border border-current/30 px-6 py-3.5 text-sm font-semibold" href={b.secondaryUrl}>{b.secondaryLabel}</Link>}</div>;
 const copy=<><p className="text-xs font-semibold uppercase tracking-[.2em] opacity-80">{b.eyebrow}</p><h2 style={{color:b.type==='cta'?(b.color&&b.color!=='#0f172a'?b.color:'#ffffff'):b.color||'var(--site-heading)'}} className="mt-4 text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-5xl">{b.title}</h2>{b.body&&<p className="mt-5 whitespace-pre-line text-base leading-8 opacity-80 sm:text-lg">{b.body}</p>}{actions}</>;
 let content;
 if(b.type==='hero') content=<section className={`page-hero relative isolate flex min-h-[440px] items-center overflow-hidden bg-slate-950 text-white ${path==='/'?'lg:min-h-[680px]':''}`} style={{'--block-padding':`${b.padding??96}px`} as CSSProperties}>
 {path==='/'?<HeroVideo/>:b.image&&<Image src={b.image} alt={b.imageAlt||''} fill priority sizes="100vw" className="hero-drift object-cover object-center"/>}<div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-slate-950/10"/><div className="absolute inset-0 bg-black" style={{opacity:(b.overlay??30)/100}}/>
 <div className={`page-block relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10 ${b.align==='center'?'text-center':''}`}><div className={`max-w-2xl ${b.align==='center'?'mx-auto':''}`}><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-100">{b.eyebrow}</p><h1 className={`mt-5 leading-[1.06] tracking-[-.045em] ${path==='/'?'site-hero-title font-light':'text-4xl font-semibold sm:text-6xl'}`}>{b.title}</h1>{b.body&&<p className="site-hero-copy mt-6 max-w-xl whitespace-pre-line text-base leading-8 text-white/85 sm:text-lg">{b.body}</p>}{actions}</div></div>
 </section>;
 else if(b.type==='platforms') content=<section className="page-block border-b border-slate-200 bg-white" style={style}><div className="mx-auto max-w-7xl px-6"><h2 className="text-center text-xs font-bold uppercase tracking-[.16em] text-slate-500">{b.title}</h2><div className="marquee-mask mt-7 overflow-hidden motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]"><div className="flex w-max animate-scrollMarquee items-center" style={{animationDuration:`${b.speed||34}s`}}>{[0,1].map(copy=><div key={copy} aria-hidden={copy===1?true:undefined} className={`flex shrink-0 items-center justify-around min-w-[720px] sm:min-w-[1200px] ${copy===1?'motion-reduce:hidden':''}`}>{supportedPlatforms.map(p=><div key={p.slug} className="relative mx-3 h-8 w-24 shrink-0 opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0 sm:mx-10 sm:h-12 sm:w-36"><Image src={'/images/platforms/'+p.slug} alt={copy===0?p.name:''} fill sizes="(max-width:640px) 96px, 144px" className="object-contain"/></div>)}</div>)}</div></div></div></section>;
 else if(b.type==='faq') content=<section className="page-block" style={style}><div className="mx-auto max-w-4xl px-6">{copy}<div className="mt-8 divide-y divide-slate-200">{b.cards?.map((c,i)=><details key={i} className="group py-5"><summary className="cursor-pointer text-lg font-semibold text-slate-900">{c.title}</summary><p className="mt-4 whitespace-pre-line leading-8 text-slate-600">{c.body}</p></details>)}</div></div></section>;
 else if(b.type==='cards') content=<section className="page-block" style={style}><div className="mx-auto max-w-7xl px-6 lg:px-10"><div className={`max-w-3xl ${b.align==='center'?'mx-auto text-center':''}`}>{copy}</div><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{b.cards?.map((c,i)=><article key={i} className="site-card border border-slate-200 bg-white p-7 text-slate-950 transition duration-300 hover:-translate-y-1 hover:shadow-lg">{c.image&&<div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-xl"><Image src={c.image} alt="" fill sizes="(max-width:768px) 100vw,33vw" className="object-cover"/></div>}<h3 className="text-xl font-semibold">{c.title}</h3><p className="mt-4 whitespace-pre-line leading-7 text-slate-600">{c.body}</p>{c.href&&<Link href={c.href} className="mt-6 inline-flex font-semibold text-blue-700">Explore <span className="sr-only">{c.title}</span><span aria-hidden="true" className="ml-2">↗</span></Link>}</article>)}</div></div></section>;
 else if(b.type==='image_text') content=<section className="page-block" style={style}><div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-10">{b.image&&<div className="relative aspect-[4/3] overflow-hidden rounded-[var(--site-card-radius)]"><Image src={b.image} alt={b.imageAlt||''} fill sizes="(max-width:1024px) 100vw,50vw" className="object-cover"/></div>}<div>{copy}</div></div></section>;
 else if(b.type==='cta') content=<section className="page-block page-cta bg-slate-950 text-white" style={{...style,backgroundColor:b.background&&b.background!=='#ffffff'?b.background:'#0f172a',color:'#ffffff'}}><div className={`mx-auto max-w-4xl px-6 ${b.align==='center'?'text-center':''}`}>{copy}</div></section>;
 else if(b.type==='spacer') content=<div aria-hidden="true" style={{height:b.height||64,background:b.background}}/>;
 else content=<section className="page-block" style={style}><div className={`mx-auto max-w-4xl px-6 ${b.align==='center'?'text-center':''}`}>{copy}</div></section>;
 return <div data-editor-section={b.id} className={editing?'editor-section relative':''}>{editing&&<button type="button" className="editor-select absolute right-3 top-3 z-30 bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow" onClick={()=>window.parent.postMessage({type:'giftgrid:select-section',id:b.id,path},location.origin)}>Edit {b.type==='hero'?'hero':b.title||b.type}</button>}{content}</div>;
}
