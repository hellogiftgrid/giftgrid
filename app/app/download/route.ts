import { NextResponse } from "next/server";
import { getAndroidRelease } from "@/lib/mobile/release";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const release = await getAndroidRelease();
  if (!release) return NextResponse.redirect(new URL("/app?install=1", request.url), { status: 307, headers: { "Cache-Control": "no-store" } });
  // Count download starts only. Store no identity, IP, or user-agent data.
  try {
    const { error } = await createAdminClient().rpc("record_android_download");
    if (error) console.warn("GiftGrid download counter unavailable.");
  } catch { console.warn("GiftGrid download counter unavailable."); }
  return NextResponse.redirect(new URL(release.href, request.url), { status: 307, headers: { "Cache-Control": "no-store" } });
}
