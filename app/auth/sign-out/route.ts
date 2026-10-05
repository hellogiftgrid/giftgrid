import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid sign-out request." }, { status: 403 });
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return NextResponse.json({ error: "Unable to sign out. Please try again." }, { status: 503 });
  return NextResponse.redirect(new URL("/auth/sign-in", request.url), 303);
}
// Old bookmarked links lead to sign-in; signing out requires a submitted form.
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/auth/sign-in", request.url), 303);
}
