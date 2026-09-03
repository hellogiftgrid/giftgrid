import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!key) {
    return NextResponse.json({
      ok: false,
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
    resendStatus: response.status,
    resendKeyConfigured: true,
    resendFromConfigured: !!from,
  });
}
