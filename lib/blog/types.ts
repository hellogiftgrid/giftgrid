export type BlogArticle={slug:string;title:string;excerpt:string;intro:string;category:string;image:string;imageAlt:string;wordCount:number;date:string;sections:{heading:string;paragraphs:string[]}[]};
export function articleWordCount(article:Pick<BlogArticle,'intro'|'sections'>){return [article.intro,...article.sections.flatMap(s=>s.paragraphs)].join(' ').match(/\b[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*\b/gu)?.length||0;}
export function validateArticle(input:unknown):BlogArticle {
 if(!input||typeof input!=='object')throw new Error('Article is missing.');const a=input as BlogArticle;
 if(typeof a.slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug)||typeof a.title!=='string'||typeof a.excerpt!=='string'||typeof a.intro!=='string'||!Array.isArray(a.sections)||a.sections.length<4||a.sections.some(s=>typeof s.heading!=='string'||!Array.isArray(s.paragraphs)||s.paragraphs.some(p=>typeof p!=='string')))throw new Error('Article content is incomplete.');
 const count=articleWordCount(a);if(count<700)throw new Error(`Article has ${count} words; at least 700 required.`);
 return {...a,wordCount:count};
}
export const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function articleHtml(article:BlogArticle){const a=validateArticle(article);return `<p>${escapeHtml(a.intro)}</p>`+a.sections.map(s=>`<h2>${escapeHtml(s.heading)}</h2>`+s.paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join('')).join('');}
