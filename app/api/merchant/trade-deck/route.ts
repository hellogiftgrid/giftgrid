import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "merchant") return NextResponse.json({ error: "A merchant account is required." }, { status: 403 });

  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: "Upload a trade deck file." }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF trade deck to upload." }, { status: 400 });
  const allowed = ["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Upload a PDF, image, or office document." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Trade decks must be 10MB or smaller." }, { status: 400 });

  const { data: merchant } = await supabase.from("merchant_profiles").select("id").eq("user_id", user.id).single();
  if (!merchant) return NextResponse.json({ error: "Merchant profile not found." }, { status: 404 });

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${user.id}/trade-deck-${Date.now()}.${ext}`;
  const { error: uploadError } = await admin.storage.from("trade-decks").upload(path, file, { contentType: file.type });
  if (uploadError) return NextResponse.json({ error: "Unable to store your trade deck." }, { status: 500 });

  const { data: doc, error } = await admin.from("documents").insert({
    merchant_id: merchant.id,
    title: file.name.slice(0, 200),
    storage_path: path,
    file_type: file.type === "application/pdf" ? "pdf" : ext,
    is_visible_to_merchant: true,
    visible_to_merchant: true,
    review_status: "pending_review",
    uploaded_by: user.id,
  }).select("id,review_status,created_at").single();
  if (error) return NextResponse.json({ error: "Unable to record your trade deck." }, { status: 500 });
  return NextResponse.json({ document: doc });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data: merchant } = await supabase.from("merchant_profiles").select("id").eq("user_id", user.id).single();
  if (!merchant) return NextResponse.json({ documents: [] });
  const { data } = await supabase.from("documents").select("id,title,file_type,review_status,created_at").eq("merchant_id", merchant.id).order("created_at", { ascending: false });
  return NextResponse.json({ documents: data || [] });
}
