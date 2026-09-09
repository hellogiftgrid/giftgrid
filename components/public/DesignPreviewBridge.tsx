'use client';
import { useEffect } from 'react';
import { pageLabels } from '@/lib/content/site-pages';
import { normalizeSiteDesign } from '@/lib/content/site-design';
export default function DesignPreviewBridge(){
 useEffect(()=>{
  if(window.parent===window||!new URLSearchParams(location.search).has('design-preview'))return;
  function receive(event:MessageEvent){
   if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='giftgrid:design-preview')return;
   const d=normalizeSiteDesign(event.data.design);
   const values:Record<string,string>={'--site-accent':d.accent,'--site-page':d.pageBackground,'--site-heading':d.headingColor,'--site-body':d.bodyColor,'--site-font':`"${d.fontFamily}"`,'--site-space':`${d.sectionSpacing}px`,'--site-card-radius':`${d.cardRadius}px`,'--site-button-radius':`${d.buttonRadius}px`,'--hero-mobile-height':`${d.mobileHeroHeight}px`,'--hero-desktop-height':`${d.desktopHeroHeight}px`,'--site-container':`${d.containerWidth}px`,'--site-header-height':`${d.headerHeight}px`,'--hero-title-desktop':`${d.desktopTitleSize}px`,'--hero-title-mobile':`${d.mobileTitleSize}px`,'--hero-body-desktop':`${d.desktopBodySize}px`,'--hero-body-mobile':`${d.mobileBodySize}px`,'--site-padding-desktop':`${d.desktopPagePadding}px`,'--site-padding-mobile':`${d.mobilePagePadding}px`,'--site-card-padding':`${d.cardPadding}px`,'--site-button-height':`${d.buttonHeight}px`};
   Object.entries(values).forEach(([key,value])=>document.body.style.setProperty(key,value));
  }
  function click(event:MouseEvent){
   const target=event.target instanceof Element?event.target:null;
   const link=target?.closest('a');if(!link)return;
   const section=target?.closest<HTMLElement>('[data-editor-section]');
   event.preventDefault();event.stopPropagation();
   if(section){window.parent.postMessage({type:'giftgrid:select-section',id:section.dataset.editorSection,path:location.pathname},location.origin);return;}
   const href=new URL(link.href,location.origin);if(href.origin===location.origin&&pageLabels[href.pathname])window.parent.postMessage({type:'giftgrid:preview-path',path:href.pathname},location.origin);
  }
  function submit(event:Event){event.preventDefault();event.stopPropagation();}
  document.addEventListener('click',click,true);
  document.addEventListener('submit',submit,true);
  window.addEventListener('message',receive);
  window.parent.postMessage({type:'giftgrid:preview-mounted'},location.origin);
  return()=>{window.removeEventListener('message',receive);document.removeEventListener('click',click,true);document.removeEventListener('submit',submit,true);};
 },[]);
 return null;
}
