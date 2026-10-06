import { NextResponse } from "next/server";
import { memberContext } from "@/lib/community/members";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  try {
    const { admin, user } = await memberContext();
    const { data: existing } = await admin.from("listing_likes").select("profile_id").eq("listing_id", id).eq("profile_id", user.id).maybeSingle();
    if (existing) {
      await admin.from("listing_likes").delete().eq("listing_id", id).eq("profile_id", user.id);
    } else {
      await admin.from("listing_likes").insert({ listing_id: id, profile_id: user.id });
    }
    const { count } = await admin.from("listing_likes").select("*", { count: "exact", head: true }).eq("listing_id", id);
    await admin.from("merchant_listings").update({ like_count: count || 0 }).eq("id", id);
    return NextResponse.json({ liked: !existing, likes: count || 0 });
  } catch (error: any) {
    const status = error?.status || 500;
    return NextResponse.json({ error: error?.message || "Unable to update like." }, { status });
  }
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { count } = await admin.from("listing_likes").select("*", { count: "exact", head: true }).eq("listing_id", id);
  return NextResponse.json({ likes: count || 0 });
}
