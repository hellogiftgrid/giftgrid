import { timingSafeEqual } from 'node:crypto';
import { runBlogPublishing } from '@/lib/blog/publish';
export const maxDuration=300;
export async function GET(request:Request){const secret=process.env.CRON_SECRET;const actual=request.headers.get('authorization')||'';const expected=`Bearer ${secret}`;if(!secret||actual.length!==expected.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return Response.json({error:'Unauthorized'},{status:401});try{return Response.json(await runBlogPublishing());}catch(error){return Response.json({error:error instanceof Error?error.message:'Publishing failed.'},{status:500});}}
