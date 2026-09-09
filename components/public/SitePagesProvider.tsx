'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { defaultPages, normalizePages, type SitePages } from '@/lib/content/site-pages';
const Context=createContext<SitePages>(defaultPages());
export function useSitePages(){return useContext(Context);}
export default function SitePagesProvider({initial,children}:{initial:SitePages;children:React.ReactNode}) {
 const [pages,setPages]=useState(initial);
 useEffect(()=>setPages(initial),[initial]);
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(window.parent===window||event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='giftgrid:design-preview')return;if(event.data.pages)setPages(normalizePages(event.data.pages));};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[]);
 return <Context.Provider value={pages}>{children}</Context.Provider>;
}
