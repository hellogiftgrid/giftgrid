import { blogAdmin } from '@/lib/blog/auth';
import { runBlogPublishing } from '@/lib/blog/publish';
export const maxDuration=300;
export async function POST(){if(!await blogAdmin())return Response.json({error:'Super-admin access required.'},{status:403});try{return Response.json(await runBlogPublishing());}catch(error){return Response.json({error:error instanceof Error?error.message:'Publishing failed.'},{status:500});}}
