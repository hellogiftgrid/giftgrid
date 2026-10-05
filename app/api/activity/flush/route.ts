import { NextResponse } from "next/server";
import { sendPendingActivityNotifications } from "@/lib/email/activity-reports";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role,is_active").eq("id", user.id).maybeSingle();
  if (profile?.role !== "merchant" || profile.is_active === false) return NextResponse.json({ error: "An active merchant account is required." }, { status: 403 });
  try {
    return NextResponse.json(await sendPendingActivityNotifications(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Activity email will retry later." }, { status: 503 });
  }
}
