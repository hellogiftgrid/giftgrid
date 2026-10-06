import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { data } = await supabase.from("buyer_profiles").select("id,company_name,website,job_title,phone,company_size,buying_categories,annual_gifting_budget,status,is_primary,created_at").eq("profile_id", user.id).order("created_at");
  return NextResponse.json({ profiles: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  let input;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const companyName = typeof input.company_name === "string" ? input.company_name.trim() : "";
  if (!companyName) return NextResponse.json({ error: "Enter a company name for this buyer profile." }, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin.from("buyer_profiles").insert({
    profile_id: user.id,
    company_name: companyName.slice(0, 200),
    website: typeof input.website === "string" ? input.website.slice(0, 500) : null,
    job_title: typeof input.job_title === "string" ? input.job_title.slice(0, 120) : null,
    phone: typeof input.phone === "string" ? input.phone.slice(0, 60) : null,
    company_size: typeof input.company_size === "string" ? input.company_size.slice(0, 60) : null,
    buying_categories: Array.isArray(input.buying_categories) ? input.buying_categories.filter((v: unknown): v is string => typeof v === "string").slice(0, 20) : [],
    annual_gifting_budget: typeof input.annual_gifting_budget === "string" ? input.annual_gifting_budget.slice(0, 120) : null,
    is_primary: input.is_primary === true,
  }).select("id,company_name,status,is_primary").single();
  if (error) return NextResponse.json({ error: "Unable to create buyer profile." }, { status: 500 });
  return NextResponse.json({ profile: data }, { status: 201 });
}
