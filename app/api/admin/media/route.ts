import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role,is_active").eq("id", user.id).single() : { data: null };
  if (!user || profile?.role !== "super_admin" || profile.is_active === false) return NextResponse.json({ error: "Super-admin access required." }, { status: 403 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > 8_000_000) return NextResponse.json({ error: "Choose an image smaller than 8MB." }, { status: 400 });
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
  const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("website-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data } = admin.storage.from("website-media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
