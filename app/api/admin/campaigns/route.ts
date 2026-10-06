import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/provider";

async function adminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile && ["admin", "super_admin"].includes(profile.role) ? { user, supabase } : null;
}

export async function GET() {
  const ctx = await adminUser();
  if (!ctx) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { data, error } = await ctx.supabase.from("campaigns").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: "Unable to load campaigns." }, { status: 500 });
  return NextResponse.json({ campaigns: data || [] });
}

export async function POST(request: Request) {
  const ctx = await adminUser();
  if (!ctx) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  let input;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  if (input.action === "send" && input.id) {
    const admin = createAdminClient();
    const { data: campaign } = await admin.from("campaigns").select("*").eq("id", input.id).single();
    if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    let query = admin.from("profiles").select("id,email").eq("is_active", true);
    if (campaign.audience !== "all") query = query.eq("role", campaign.audience === "community" ? "merchant" : campaign.audience);
    const { data: recipients } = await query.limit(1000);
    const emails = (recipients || []).map((r: any) => r.email).filter(Boolean);
    if (!emails.length) return NextResponse.json({ error: "No recipients for this audience." }, { status: 400 });
    await sendEmail({ to: emails, subject: campaign.subject, html: campaign.html, idempotencyKey: `campaign-${campaign.id}` });
    await admin.from("campaigns").update({ status: "sent", sent_count: emails.length, sent_at: new Date().toISOString() }).eq("id", campaign.id);
    return NextResponse.json({ sent: emails.length });
  }

  const subject = typeof input.subject === "string" ? input.subject.trim() : "";
  const html = typeof input.html === "string" ? input.html : "";
  const audience = ["all", "merchant", "buyer", "community"].includes(input.audience) ? input.audience : "all";
  if (!subject || !html) return NextResponse.json({ error: "Provide a subject and content." }, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin.from("campaigns").insert({ subject, html, audience, created_by: ctx.user.id }).select().single();
  if (error) return NextResponse.json({ error: "Unable to create campaign." }, { status: 500 });
  return NextResponse.json({ campaign: data }, { status: 201 });
}
