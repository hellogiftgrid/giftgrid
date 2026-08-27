import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createGoogleOAuthClient,
  googleCalendarScopes,
} from "@/lib/google/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/sign-in", request.url)
    );
  }

  const oauth = createGoogleOAuthClient();

  const url = oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: googleCalendarScopes(),
    state: user.id,
  });

  return NextResponse.redirect(url);
}
