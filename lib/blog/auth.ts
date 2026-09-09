import { createClient } from '@/lib/supabase/server';
export async function blogAdmin(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return null;const {data:p}=await supabase.from('profiles').select('role,is_active').eq('id',user.id).single();return p?.role==='super_admin'&&p.is_active!==false?user:null;}
