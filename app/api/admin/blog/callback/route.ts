import { NextRequest,NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { blogAdmin } from '@/lib/blog/auth';
import { bloggerOAuth,bloggerHosts,encryptToken } from '@/lib/blog/blogger';
import { createAdminClient } from '@/lib/supabase/admin';
export async function GET(request:NextRequest){
 const user=await blogAdmin();if(!user)return NextResponse.json({error:'Super-admin access required.'},{status:403});
 const finish=(key:string,value:string)=>{const response=NextResponse.redirect(new URL(`/admin/blog?${key}=${encodeURIComponent(value)}`,request.url));response.cookies.set('giftgrid_blogger_state','',{path:'/api/admin/blog',maxAge:0});return response;};
 const expected=request.cookies.get('giftgrid_blogger_state')?.value||'';const state=request.nextUrl.searchParams.get('state')||'';const actual=`${user.id}:${state}`;
 if(!expected||actual.length!==expected.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return finish('error','The connection expired. Please try again.');
 const code=request.nextUrl.searchParams.get('code');if(!code)return finish('error','Google authorization was not completed.');
 try{const oauth=bloggerOAuth();const {tokens}=await oauth.getToken(code);oauth.setCredentials(tokens);if(!tokens.refresh_token)throw new Error('Please grant offline access when reconnecting Blogger.');
 const response=await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs?view=AUTHOR',{headers:{Authorization:`Bearer ${tokens.access_token}`},signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('Could not read your Blogger blogs. Check that the Blogger API is enabled.');
 const data=await response.json();const blogs=(data.items||[]).filter((b:{url:string})=>{try{return bloggerHosts.includes(new URL(b.url).hostname);}catch{return false;}});if(!blogs.length)throw new Error('This Google account does not have publishing access to either requested blog.');
 const db=createAdminClient();const {error}=await db.from('blog_connections').upsert(blogs.map((b:{id:string;url:string;name:string})=>({blog_id:b.id,hostname:new URL(b.url).hostname,name:b.name,encrypted_refresh_token:encryptToken(tokens.refresh_token!),connected_by:user.id,updated_at:new Date().toISOString()})),{onConflict:'blog_id'});if(error)throw new Error('Could not save the Blogger connection. Apply the blog database migration.');
 return finish('connected',String(blogs.length));
 }catch(error){return finish('error',error instanceof Error?error.message:'Could not connect Blogger.');}
}
