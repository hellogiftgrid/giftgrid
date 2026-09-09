import PageSections from '@/components/public/PageSections';
import BlogExplorer from '@/components/public/BlogExplorer';
import { getArticles } from '@/lib/blog/articles';
export const metadata={title:'GiftGrid Journal — Readiness, Gifting and Merchant Growth',description:'Practical guides to stronger stores, thoughtful corporate gifts and clearer commercial conversations.',alternates:{canonical:'/blog'}};
export default async function BlogPage(){const articles=await getArticles();return <main className="bg-slate-50"><PageSections path="/blog"/><BlogExplorer articles={articles.map(({sections,intro,...summary})=>summary)}/></main>;}
