import { getArticles } from '@/lib/blog/articles';
import { articleHtml } from '@/lib/blog/types';
export async function GET(){const articles=await getArticles();return Response.json({version:'https://jsonfeed.org/version/1.1',title:'GiftGrid Journal',home_page_url:'https://www.degiftgrid.com/blog',feed_url:'https://www.degiftgrid.com/blog/feed.json',items:articles.map(a=>({id:a.slug,url:`https://www.degiftgrid.com/blog/${a.slug}`,title:a.title,summary:a.excerpt,content_html:articleHtml(a),date_published:`${a.date}T12:00:00Z`,image:`https://www.degiftgrid.com${a.image}`,_giftgrid:a}))});}
