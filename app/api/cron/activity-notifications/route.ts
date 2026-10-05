import { timingSafeEqual } from "node:crypto";
import { sendNightlyActivitySummary, sendPendingActivityNotifications } from "@/lib/email/activity-reports";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const actual = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  if (!secret || actual.length !== expected.length || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const notifications = await sendPendingActivityNotifications();
    const summary = await sendNightlyActivitySummary();
    return Response.json({ status: "complete", notifications, summary });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Activity email job failed." }, { status: 500 });
  }
}
