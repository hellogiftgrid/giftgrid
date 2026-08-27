import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGoogleOAuthClient } from "@/lib/google/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=session_required", request.url)
    );
  }

  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/admin/calls?google_error=${encodeURIComponent(error)}`,
        request.url
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/admin/calls?google_error=missing_code",
        request.url
      )
    );
  }

  if (!state || state !== user.id) {
    return NextResponse.redirect(
      new URL(
        "/admin/calls?google_error=invalid_state",
        request.url
      )
    );
  }

  try {
    const oauth = createGoogleOAuthClient();

    const { tokens } = await oauth.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL(
          "/admin/calls?google_error=no_refresh_token",
          request.url
        )
      );
    }

    /*
     * For the first working version we put the refresh token in the
     * user's booking_admin record. The service-role client should
     * eventually be used for this write so normal RLS never exposes
     * credentials to public users.
     */

    const { error: updateError } = await supabase
      .from("booking_admins")
      .update({
        google_refresh_token: tokens.refresh_token,
        google_access_token: tokens.access_token ?? null,
        google_token_expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
      })
      .eq("profile_id", user.id);

    if (updateError) {
      console.error(
        "Google Calendar token save error:",
        updateError
      );

      return NextResponse.redirect(
        new URL(
          "/admin/calls?google_error=token_save_failed",
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL(
        "/admin/calls?google_connected=true",
        request.url
      )
    );
  } catch (err) {
    console.error("Google Calendar callback error:", err);

    return NextResponse.redirect(
      new URL(
        "/admin/calls?google_error=oauth_failed",
        request.url
      )
    );
  }
}
