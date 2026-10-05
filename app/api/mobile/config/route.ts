import { NextResponse } from "next/server";

// The Supabase URL and publishable key are public client credentials. Keep
// server-only keys out of this response; the native app uses user JWTs.
export async function GET() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !key) return NextResponse.json({ error: "Mobile sign-in is not configured." }, { status: 503 });
  return NextResponse.json({ url, key }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
