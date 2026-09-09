import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_TRADE_DECK_BYTES = 500_000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Upload a PDF trade deck." }, { status: 400 });
  }
  if (file.size > MAX_TRADE_DECK_BYTES) {
    return NextResponse.json({ error: "Trade decks must be smaller than 500 KB." }, { status: 400 });
  }

  const { data: merchant, error: merchantError } = await supabase
    .from("merchant_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .single();
  if (merchantError || !merchant) return NextResponse.json({ error: "Merchant profile not found." }, { status: 404 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "trade-deck.pdf";
  const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
  const admin = createAdminClient();
  const upload = await admin.storage.from("trade-decks").upload(storagePath, file, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });

  const { data: document, error: documentError } = await admin
    .from("documents")
    .insert({
      merchant_id: merchant.id,
      title: file.name,
      storage_path: storagePath,
      visible_to_merchant: true,
    })
    .select("id, title, storage_path, created_at")
    .single();
  if (documentError) {
    await admin.storage.from("trade-decks").remove([storagePath]);
    return NextResponse.json({ error: documentError.message }, { status: 500 });
  }

  return NextResponse.json({ document });
}
