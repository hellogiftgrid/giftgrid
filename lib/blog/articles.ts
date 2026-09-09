import { cache } from 'react';
import library from './library.json';
import { type BlogArticle, validateArticle } from './types';
import { createClient } from '@/lib/supabase/server';
export const seedArticles=library as BlogArticle[];
export const getArticles=cache(async()=>{
 const result=new Map<string,BlogArticle>(seedArticles.map(a=>[a.slug,a]));
 try{const supabase=await createClient();const {data,error}=await supabase.from('blog_articles').select('article').eq('status','published').order('published_at',{ascending:false});if(error)console.error('Blog database unavailable:',error.code);for(const row of data||[]){try{const article=validateArticle(row.article);result.set(article.slug,article);}catch{}}}catch{console.error('Could not read published blog articles.');}
 return [...result.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title));
});
export async function getArticle(slug:string){return (await getArticles()).find(a=>a.slug===slug);}
