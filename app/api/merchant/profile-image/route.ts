import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2_000_000) {
    return NextResponse.json({ error: "Upload a JPG, PNG, or WebP image under 2 MB." }, { status: 400 });
  }
  const path = `merchant-profiles/${user.id}/${randomUUID()}.${file.type.split("/")[1]}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("website-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  const { data } = admin.storage.from("website-media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
