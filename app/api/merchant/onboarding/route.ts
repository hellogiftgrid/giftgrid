import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "merchant") return NextResponse.json({ error: "A merchant account is required." }, { status: 403 });
  let input;
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid profile request." }, { status: 400 }); }
  const field = (key: string): string => typeof input?.[key] === "string" ? input[key].trim().slice(0, 2000) : "";
  const businessName = field("businessName"), businessCategory = field("businessCategory"), country = field("country"), email = field("businessEmail"), fullName = field("fullName"), storeUrl = field("storeUrl");
  if (!businessName || !businessCategory || !country || !fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter your name, business name, category, country, and valid business email." }, { status: 400 });
  if (storeUrl) {
    try { if (!["https:", "http:"].includes(new URL(storeUrl).protocol)) throw new Error(); }
    catch { return NextResponse.json({ error: "Enter a valid website URL or leave it blank." }, { status: 400 }); }
  }
  const { data: merchant, error: merchantError } = await supabase.from("merchant_profiles").select("id").eq("user_id", user.id).single();
  if (merchantError || !merchant) return NextResponse.json({ error: "Merchant profile not found." }, { status: 404 });
  const admin = createAdminClient();

  const { error: profileError } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  if (profileError) return NextResponse.json({ error: "Unable to update your name. Please retry." }, { status: 500 });
  const { error } = await admin.from("merchant_profiles").update({ business_name: businessName, business_category: businessCategory, country, business_email: email, store_url: storeUrl || null, phone: field("phone") || null, product_category: field("productCategory") || null, business_description: field("businessDescription") || null, onboarding_completed_at: new Date().toISOString() }).eq("id", merchant.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Unable to save your business profile." }, { status: 500 });
  return NextResponse.json({ complete: true, qualified: true });
}
