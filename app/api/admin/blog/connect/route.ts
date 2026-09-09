import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { blogAdmin } from '@/lib/blog/auth';
import { bloggerOAuth } from '@/lib/blog/blogger';
export async function GET(request:Request){
 const user=await blogAdmin();if(!user)return NextResponse.json({error:'Super-admin access required.'},{status:403});
 try{const state=randomBytes(32).toString('hex');const url=bloggerOAuth().generateAuthUrl({access_type:'offline',prompt:'consent',scope:['https://www.googleapis.com/auth/blogger'],state});const response=NextResponse.redirect(url);response.cookies.set('giftgrid_blogger_state',`${user.id}:${state}`,{httpOnly:true,secure:new URL(request.url).protocol==='https:',sameSite:'lax',path:'/api/admin/blog',maxAge:600});return response;}catch(error){return NextResponse.redirect(new URL('/admin/blog?error='+encodeURIComponent(error instanceof Error?error.message:'Blogger is not configured.'),request.url));}
}
