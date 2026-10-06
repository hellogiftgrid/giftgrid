import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

const MESSAGES = [
  "Hi, this is GiftGrid Support checking in — anything we can help you source today?",
  "Quick note from GiftGrid Support: reply here if you need help with a brief or listing.",
  "GiftGrid Support here. This chat continues whenever you reply — how is your sourcing going?",
  "Hello from GiftGrid Support. We noticed new activity on your account — need a hand?",
  "GiftGrid Support checking back in. Reply to continue the conversation.",
];

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const actual = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  if (!secret || actual.length !== expected.length || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await admin.from("support_outreach").select("profile_id,created_at").gte("created_at", since);
  const counts = new Map<string, number>();
  for (const row of recent || []) counts.set(row.profile_id, (counts.get(row.profile_id) || 0) + 1);

  const { data: profiles } = await admin.from("profiles").select("id,full_name").eq("is_active", true).limit(500);
  const today = new Date().toISOString().slice(0, 10);
  let sent = 0;
  for (const profile of profiles || []) {
    if ((counts.get(profile.id) || 0) >= 5) continue;
    const message = MESSAGES[sent % MESSAGES.length];
    const { error } = await admin.from("support_outreach").insert({ profile_id: profile.id, message });
    if (error) continue;
    await admin.from("notifications").insert({ profile_id: profile.id, title: "GiftGrid Support", body: message });
    sent += 1;
    if (sent >= 500) break;
  }
  return Response.json({ status: "complete", sent, day: today }, { headers: { "Cache-Control": "no-store" } });
}
