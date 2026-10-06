import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("merchant_ranking").select("*").order("rank", { ascending: true }).limit(100);
  if (error) return NextResponse.json({ error: "Unable to load merchant rankings." }, { status: 500 });
  return NextResponse.json({ ranking: data || [] }, { headers: { "Cache-Control": "public, max-age=60" } });
}
