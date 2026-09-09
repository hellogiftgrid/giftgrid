import { createAdminClient } from '@/lib/supabase/admin';
import { seedArticles } from './articles';
import { validateArticle,type BlogArticle } from './types';
import { connections,publishBlogger } from './blogger';
import { generateBlogArticle,planNextArticle } from './generate';
import { publishDailyFaqUpdate } from './faq-updates';
import { publishArticleToCommunity } from './community';

export async function runBlogPublishing(){
 const db=createAdminClient();const today=new Date().toISOString().slice(0,10);const job=`daily:${today}`;
 const {data:claimed,error:claimError}=await db.rpc('claim_blog_job',{job_id:job});if(claimError)throw new Error('Apply the blog database migration before starting the publishing queue.');if(!claimed)return {status:'already_running_or_complete'};
 try{
  if(seedArticles.length){const {error}=await db.from('blog_articles').upsert(seedArticles.map(a=>({slug:a.slug,article:validateArticle(a),status:'published',published_at:`${a.date}T12:00:00Z`})),{onConflict:'slug',ignoreDuplicates:true});if(error)throw new Error('Could not prepare the article library.');const {error:publishError}=await db.from('blog_articles').update({status:'published'}).in('slug',seedArticles.map(a=>a.slug));if(publishError)throw new Error('Could not publish the prepared library.');}
  const destinations=await connections();
  const {data:rows,error}=await db.from('blog_articles').select('slug,article').eq('status','published').order('published_at').order('slug');if(error)throw new Error('Could not read the publishing queue.');
  const {data:deliveries,error:deliveryError}=await db.from('blog_publications').select('slug,blog_id').eq('status','published');if(deliveryError)throw new Error('Could not read existing publication records.');
  const done=new Set((deliveries||[]).map(d=>`${d.slug}:${d.blog_id}`));
  let next=(rows||[]).find(row=>destinations.some(d=>!done.has(`${row.slug}:${d.blog_id}`)));
  // The initial fifty articles are already available on GiftGrid. Thereafter create
  // one new useful guide per day, with a stable date slug so retries reuse it.
  let community: unknown = null;
  // Generate one new article per day once the prepared library has been
  // delivered. Blogger connections are optional: GiftGrid and the community
  // should still receive the article while Blogger is being connected.
  if(!next){
   const slug=`giftgrid-guide-${today}`;const existing=(rows||[]).find(r=>r.slug===slug);
   const article=existing?validateArticle(existing.article):await generateBlogArticle({slug,...await planNextArticle((rows||[]).map(r=>(r.article as BlogArticle).title))});
   const {error:writeError}=await db.from('blog_articles').upsert({slug,article,status:'published'},{onConflict:'slug',ignoreDuplicates:true});if(writeError)throw new Error('Could not publish the new GiftGrid article.');next={slug,article};
  }
  // Keep the community announcement resilient to a crash between saving the
  // article and delivering it to Blogger. The upsert in the helper is safe on
  // every retry because the system key is unique.
  const dailyArticle=(next?.slug===`giftgrid-guide-${today}`?next:(rows||[]).find(r=>r.slug===`giftgrid-guide-${today}`));
  if(dailyArticle){try { community = await publishArticleToCommunity(validateArticle(dailyArticle.article)); } catch (error) { community = { status: 'failed', error: error instanceof Error ? error.message : 'Community publishing failed.' }; }}
  const results:{host:string;status:string;url?:string;error?:string}[]=[];
  if(next){const article=validateArticle(next.article);for(const destination of destinations){if(done.has(`${article.slug}:${destination.blog_id}`))continue;try{const result=await publishBlogger(article,destination);const {error:saveError}=await db.from('blog_publications').upsert({slug:article.slug,blog_id:destination.blog_id,...result,status:'published',error:null,updated_at:new Date().toISOString()},{onConflict:'slug,blog_id'});if(saveError)throw new Error('The Blogger post exists but its delivery record could not be saved. Retry will reconcile it.');results.push({host:destination.hostname,status:'published',url:result.url});}catch(error){const message=error instanceof Error?error.message:'Publishing failed.';await db.from('blog_publications').upsert({slug:article.slug,blog_id:destination.blog_id,status:'failed',error:message,updated_at:new Date().toISOString()},{onConflict:'slug,blog_id'});results.push({host:destination.hostname,status:'failed',error:message});}}}
  let faq: unknown = null;
  try { faq = await publishDailyFaqUpdate(); } catch (error) { faq = { status: "failed", error: error instanceof Error ? error.message : "FAQ update failed" }; }
  const result={status:community&&((community as {status?:string}).status==='failed')?'retry_required':destinations.length<2?'connection_required':results.some(r=>r.status==='failed')?'retry_required':'complete',giftgrid:'published',article:next?.slug||null,connectedBlogs:destinations.length,results,community,faq};
  const {error:jobError}=await db.from('blog_jobs').update({result,completed_at:result.status==='complete'?new Date().toISOString():null,lease_until:new Date().toISOString()}).eq('id',job);if(jobError)throw new Error('Could not save the publishing job status.');return result;
 }catch(error){await db.from('blog_jobs').update({lease_until:new Date().toISOString(),result:{error:error instanceof Error?error.message:'Job failed.'}}).eq('id',job);throw error;}
}
