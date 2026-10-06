import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function aiRating(clicks: number, impressions: number, reviewAvg: number, reviews: number) {
  const engagement = impressions > 0 ? Math.min(5, (clicks / impressions) * 25) : 0;
  return Math.max(0, Math.min(5, (reviewAvg || 0) * 0.7 + engagement * 0.3 + (reviews > 0 ? 0.5 : 0))).toFixed(2);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  let type = "impression";
  try { const body = await request.json(); if (body?.type === "click") type = "click"; } catch {}
  const admin = createAdminClient();
  const { data } = await admin.from("merchant_listings").select("click_count,impression_count,average_rating,review_count").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const clicks = (data.click_count || 0) + (type === "click" ? 1 : 0);
  const impressions = (data.impression_count || 0) + (type === "impression" ? 1 : 0);
  const { error } = await admin.from("merchant_listings").update({
    click_count: clicks,
    impression_count: impressions,
    ai_rating: Number(aiRating(clicks, impressions, Number(data.average_rating), data.review_count)),
  }).eq("id", id);
  if (error) return NextResponse.json({ error: "Unable to record interaction." }, { status: 500 });
  return NextResponse.json({ tracked: type }, { headers: { "Cache-Control": "no-store" } });
}
