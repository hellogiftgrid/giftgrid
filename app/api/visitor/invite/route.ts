import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/provider";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body?.consent !== true) return NextResponse.json({ error: "A valid email and consent are required." }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase.from("outreach_leads").insert({ email, source: "visitor_invite_opt_in", status: "new", notes: "Visitor requested registration options and consented to email." });
  if (error) return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
  try {
    await sendEmail({ to: email, subject: "Choose your GiftGrid path", idempotencyKey: `visitor-invite-${email}`, html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>What would you like to do with GiftGrid?</h2><p>You asked us to send the next steps. Choose an option below:</p><p><a href="https://www.degiftgrid.com/buyers/apply" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Apply as a gifting partner</a></p><p><a href="https://www.degiftgrid.com/auth/sign-up" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Register as a merchant</a></p><p style="font-size:12px;color:#64748b">You received this because you requested these options on GiftGrid. Contact support@degiftgrid.com to stop future messages.</p></div>` });
  } catch (emailError) {
    console.error("Visitor invite email failed:", emailError);
  }
  return NextResponse.json({ ok: true });
}
