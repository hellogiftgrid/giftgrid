import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeSections } from "@/lib/content/site-sections";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role,is_active").eq("id", user.id).single();
  if (profile?.role !== "super_admin" || profile.is_active === false) return NextResponse.json({ error: "Super-admin access required." }, { status: 403 });
  const sections = normalizeSections((await request.json())?.sections);
  const { error } = await supabase.from("settings").upsert({ key: "site_sections", value: sections, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, sections });
}
