import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { normalizeSiteDesign } from '@/lib/content/site-design';
import { normalizePages } from '@/lib/content/site-pages';
export async function POST(request:Request){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in to save your website.'},{status:401});
 const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',user.id).single();
 if(profile?.role!=='super_admin'||profile.is_active===false)return NextResponse.json({error:'Super-admin access required.'},{status:403});
 try{
 const body=await request.json();if(!['draft','publish'].includes(body.action)||!body.pages||!body.design)return NextResponse.json({error:'A complete design and page document are required.'},{status:400});
 const design=normalizeSiteDesign(body.design);const pages=normalizePages(body.pages,design);const document={design,pages};const updated_at=new Date().toISOString();
 // One PostgREST upsert is one database transaction: theme and page content publish together.
 const records: {key:string;value:unknown;updated_at:string}[]=body.action==='publish'?[{key:'site_design',value:design,updated_at},{key:'site_pages',value:pages,updated_at},{key:'site_editor_draft',value:{},updated_at}]:[{key:'site_editor_draft',value:document,updated_at}];
 const {error}=await supabase.from('settings').upsert(records,{onConflict:'key'});if(error)throw new Error(error.message);
 if(body.action==='publish')revalidatePath('/','layout');
 return NextResponse.json({document,action:body.action});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not save website.'},{status:400});}
}
