import { createClient } from '@/lib/supabase/server';
import { requireSuperAdmin } from '@/lib/admin/require-super-admin';
import WebsiteDesignEditor from '@/components/admin/WebsiteDesignEditor';
import { normalizeSiteDesign } from '@/lib/content/site-design';
import { normalizePages } from '@/lib/content/site-pages';
export const metadata={title:'Website Editor — GiftGrid Admin'};
export default async function WebsiteDesignPage(){
 await requireSuperAdmin();const supabase=await createClient();
 const {data,error}=await supabase.from('settings').select('key,value').in('key',['site_design','site_pages','site_sections','site_editor_draft']);
 if(error)return <p role="alert">Could not load the website settings. Please reload before editing.</p>;
 const values=new Map((data||[]).map(item=>[item.key,item.value]));const design=normalizeSiteDesign(values.get('site_design'));
 return <WebsiteDesignEditor initial={design} initialPages={normalizePages(values.get('site_pages'),design,values.get('site_sections'))} draft={values.get('site_editor_draft')?.pages ? values.get('site_editor_draft') : null}/>;
}
