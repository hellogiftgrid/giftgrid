import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const brevoKey = process.env.BREVO_API_KEY;
  const brevoFrom = process.env.BREVO_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;

  if (brevoKey) {
    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: { "api-key": brevoKey },
      cache: "no-store",
    });

    return NextResponse.json({
      ok: response.ok,
      provider: "brevo",
      brevoStatus: response.status,
      brevoKeyConfigured: true,
      brevoFromConfigured: !!brevoFrom,
    });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!key) {
    return NextResponse.json({
      ok: false,
      provider: "none",
      brevoKeyConfigured: false,
      brevoFromConfigured: !!brevoFrom,
      resendKeyConfigured: false,
      resendFromConfigured: !!from,
    });
  }

  const response = await fetch("https://api.resend.com/api-keys", {
    headers: {
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  return NextResponse.json({
    ok: response.ok,
    provider: "resend",
    brevoKeyConfigured: false,
    brevoFromConfigured: !!brevoFrom,
    resendStatus: response.status,
    resendKeyConfigured: true,
    resendFromConfigured: !!from,
  });
}
