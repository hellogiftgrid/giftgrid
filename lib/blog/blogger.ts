import { createCipheriv,createDecipheriv,createHash,randomBytes } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { createAdminClient } from '@/lib/supabase/admin';
import { articleHtml,escapeHtml,type BlogArticle } from './types';
export const bloggerHosts=['gift-grid.blogspot.com','degiftgrid.blogspot.com'];
export function bloggerOAuth(){const id=process.env.BLOGGER_CLIENT_ID||process.env.GOOGLE_CLIENT_ID;const secret=process.env.BLOGGER_CLIENT_SECRET||process.env.GOOGLE_CLIENT_SECRET;if(!id||!secret)throw new Error('Configure the Google OAuth client for Blogger.');return new OAuth2Client(id,secret,process.env.BLOGGER_REDIRECT_URI||'https://www.degiftgrid.com/api/admin/blog/callback');}
function encryptionKey(){const secret=process.env.BLOGGER_TOKEN_ENCRYPTION_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;if(!secret)throw new Error('Blogger token encryption is not configured.');return createHash('sha256').update(secret).digest();}
export function encryptToken(token:string){const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',encryptionKey(),iv);const encrypted=Buffer.concat([cipher.update(token,'utf8'),cipher.final()]);return [iv,cipher.getAuthTag(),encrypted].map(v=>v.toString('base64')).join('.');}
function decryptToken(value:string){const [iv,tag,data]=value.split('.').map(v=>Buffer.from(v,'base64'));const cipher=createDecipheriv('aes-256-gcm',encryptionKey(),iv);cipher.setAuthTag(tag);return Buffer.concat([cipher.update(data),cipher.final()]).toString('utf8');}
export async function publishBlogger(a:BlogArticle,connection:{blog_id:string;hostname:string;encrypted_refresh_token:string}){
 const oauth=bloggerOAuth();oauth.setCredentials({refresh_token:decryptToken(connection.encrypted_refresh_token)});const {token}=await oauth.getAccessToken();if(!token)throw new Error('Reconnect your Blogger account.');
 const base=`https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(connection.blog_id)}/posts`;const label=`giftgrid-${a.slug}`;
 // Reconcile by a stable label before inserting: a lost response must not create a duplicate.
 const existing=await fetch(`${base}?labels=${encodeURIComponent(label)}&status=live&fetchBodies=false`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(30000)});
 if(!existing.ok)throw new Error(`Blogger lookup failed (${existing.status}).`);
 const found=(await existing.json()).items?.[0];if(found)return {post_id:found.id as string,url:found.url as string};
 const url=`https://www.degiftgrid.com/blog/${a.slug}`;
 const content=`<p><em>From the <a href="${url}">GiftGrid Journal</a>.</em></p><img src="https://www.degiftgrid.com${escapeHtml(a.image)}" alt="${escapeHtml(a.imageAlt)}"/>${articleHtml(a)}<p>Read more practical guides at <a href="https://www.degiftgrid.com/blog">GiftGrid</a>.</p>`;
 const response=await fetch(`${base}?isDraft=false`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({kind:'blogger#post',title:a.title,content,labels:[a.category,label]}),signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw new Error(`Blogger publishing failed (${response.status}).`);const result=await response.json();
 return {post_id:result.id as string,url:result.url as string};
}
export async function connections(){const db=createAdminClient();const {data,error}=await db.from('blog_connections').select('blog_id,hostname,name,encrypted_refresh_token');if(error)throw new Error('Blog database is not ready. Apply the blog migration.');return data||[];}
