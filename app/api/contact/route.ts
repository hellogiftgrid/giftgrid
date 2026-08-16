import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.name !== "string" || typeof body.email !== "string") {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { name, business, email, storeUrl, message } = body as {
    name: string;
    business?: string;
    email: string;
    storeUrl?: string;
    message?: string;
  };

  // If Supabase isn't configured yet (e.g. first local preview, no project
  // provisioned), don't fail the form — log and return success so the UI
  // isn't blocked on infra that hasn't been set up.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[/api/contact] Supabase not configured — contact submission not persisted:", {
      name,
      business,
      email,
      storeUrl,
    });
    return NextResponse.json({ ok: true, persisted: false });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("outreach_leads").insert({
    merchant_name: name,
    business_name: business ?? null,
    email,
    store_url: storeUrl ?? null,
    source: "contact_form",
    notes: message ?? null,
  });

  if (error) {
    console.error("[/api/contact] Failed to insert lead:", error.message);
    return NextResponse.json({ error: "Could not submit your message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
