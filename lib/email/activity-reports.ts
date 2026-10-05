import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/provider";

const REPORT_EMAIL = process.env.ACTIVITY_REPORT_EMAIL || "solomonwinner560@gmail.com";

type ActivityEvent = {
  id: string;
  event_type: "buyer_inquiry" | "product_listing" | "post_comment" | "post_like";
  owner_profile_id: string | null;
  actor_name: string;
  summary: string;
  image_url: string | null;
  href: string;
  created_at: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

function safeImage(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value, "https://www.degiftgrid.com");
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null;
  } catch { return null; }
}

function eventMarkup(event: ActivityEvent) {
  const image = safeImage(event.image_url);
  const link = event.href.startsWith("/") ? `https://www.degiftgrid.com${event.href}` : "https://www.degiftgrid.com/admin/marketplace";
  return `<tr><td style="padding:14px 0;border-bottom:1px solid #e2e8f0">${image ? `<img src="${escapeHtml(image)}" alt="" width="88" height="72" style="float:left;object-fit:cover;border-radius:8px;margin:0 14px 8px 0">` : ""}<strong>${escapeHtml(event.summary)}</strong><br><span style="color:#64748b;font-size:12px">${escapeHtml(new Date(event.created_at).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }))} UTC</span><br><a href="${escapeHtml(link)}" style="color:#4f46e5">Open GiftGrid</a><div style="clear:both"></div></td></tr>`;
}

async function getOwnerProfileId(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin.from("profiles").select("id").eq("email", REPORT_EMAIL).eq("is_active", true).maybeSingle();
  return data?.id || null;
}

export async function sendPendingActivityNotifications() {
  const admin = createAdminClient();
  const ownerId = await getOwnerProfileId(admin);
  const { data: events, error } = await admin.from("activity_email_events").select("id,event_type,owner_profile_id,actor_name,summary,image_url,href,created_at").is("sent_at", null).is("ignored_at", null).order("created_at", { ascending: true }).limit(100);
  if (error) throw new Error("Unable to load queued activity notifications.");
  const rows = (events || []) as ActivityEvent[];
  const ignored = rows.filter((event) => (event.event_type === "post_comment" || event.event_type === "post_like") && (!ownerId || event.owner_profile_id !== ownerId));
  const deliver = rows.filter((event) => !ignored.includes(event));
  const now = new Date().toISOString();
  if (ignored.length) {
    const { error: ignoreError } = await admin.from("activity_email_events").update({ ignored_at: now }).in("id", ignored.map((event) => event.id));
    if (ignoreError) throw new Error("Unable to close unrelated activity notifications.");
  }
  if (!deliver.length) return { sent: 0, ignored: ignored.length };

  await sendEmail({
    to: REPORT_EMAIL,
    subject: `GiftGrid activity: ${deliver.length} new update${deliver.length === 1 ? "" : "s"}`,
    idempotencyKey: `giftgrid-activity-${deliver[0].id}-${deliver[deliver.length - 1].id}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#0f172a"><h1 style="font-size:22px">GiftGrid activity</h1><p>${deliver.length} new buyer request, product submission, comment, or like${deliver.length === 1 ? "" : "s"} since the last update.</p><table style="width:100%;border-collapse:collapse">${deliver.map(eventMarkup).join("")}</table><p style="margin-top:24px;color:#64748b;font-size:12px">These updates were sent only to the configured GiftGrid activity report address.</p></div>`,
  });
  const { error: markError } = await admin.from("activity_email_events").update({ sent_at: now }).in("id", deliver.map((event) => event.id));
  if (markError) throw new Error("Email sent, but the activity queue could not be marked as delivered.");
  return { sent: deliver.length, ignored: ignored.length };
}

export async function sendNightlyActivitySummary() {
  const admin = createAdminClient();
  const ownerId = await getOwnerProfileId(admin);
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const { data: existing } = await admin.from("activity_email_summaries").select("summary_date").eq("summary_date", day).maybeSingle();
  if (existing) return { sent: false, reason: "already_sent" };
  const since = new Date(`${day}T00:00:00.000Z`).toISOString();
  const types = ["buyer_inquiry", "product_listing", "post_comment", "post_like"] as const;
  const counts = await Promise.all(types.map(async (eventType) => {
    let query = admin.from("activity_email_events").select("id", { count: "exact", head: true }).eq("event_type", eventType).gte("created_at", since);
    if (eventType === "post_comment" || eventType === "post_like") {
      if (ownerId) query = query.eq("owner_profile_id", ownerId);
      else query = query.eq("owner_profile_id", "00000000-0000-0000-0000-000000000000");
    }
    const { count, error } = await query;
    if (error) throw new Error("Unable to count daily GiftGrid activity.");
    return [eventType, count || 0] as const;
  }));
  const labels: Record<string, string> = { buyer_inquiry: "Buyer inquiries", product_listing: "Product submissions", post_comment: "Comments on your posts", post_like: "Likes on your posts" };
  const total = counts.reduce((sum, [, count]) => sum + count, 0);
  const rows = counts.map(([type, count]) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0">${labels[type]}</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold">${count}</td></tr>`).join("");
  await sendEmail({ to: REPORT_EMAIL, subject: `GiftGrid nightly activity summary · ${day}`, idempotencyKey: `giftgrid-nightly-activity-${day}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0f172a"><h1 style="font-size:22px">GiftGrid nightly activity summary</h1><p>Activity recorded on ${day} (UTC).</p><table style="width:100%;border-collapse:collapse">${rows}<tr><td style="padding:12px 0;font-weight:bold">Total</td><td style="padding:12px 0;text-align:right;font-weight:bold">${total}</td></tr></table><p style="margin-top:24px"><a href="https://www.degiftgrid.com/admin/marketplace" style="color:#4f46e5">Review requests and product submissions</a></p></div>` });
  const { error } = await admin.from("activity_email_summaries").insert({ summary_date: day });
  if (error) throw new Error("Summary sent, but its delivery record could not be saved.");
  return { sent: true, day, total };
}
