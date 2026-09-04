import { NextResponse } from "next/server";
import { sendGiftGridEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await sendGiftGridEmail({
      to: "hello@degiftgrid.com",
      subject: "GiftGrid email test",
      html: `
        <!doctype html>
        <html>
          <body style="margin:0;padding:40px;font-family:Arial,sans-serif;background:#f7f9fc">
            <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:32px">
              <h1 style="margin:0 0 16px;color:#4F46E5">GiftGrid</h1>

              <h2 style="margin:0 0 12px;color:#111827">
                Email delivery test
              </h2>

              <p style="color:#4b5563;line-height:1.7">
                This message was sent from:
              </p>

              <p style="font-weight:700;color:#111827">
                no-reply@degiftgrid.com
              </p>

              <p style="color:#6b7280;font-size:13px">
                Reply-To: hello@degiftgrid.com
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Email failed",
      },
      { status: 500 }
    );
  }
}
