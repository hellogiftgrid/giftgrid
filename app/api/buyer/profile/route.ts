import { NextResponse } from "next/server";
import { ApiError, apiFailure, jsonInput } from "@/lib/developer/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Sign in to update your buyer profile.");

    const input = await jsonInput(request);
    const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
    const companyName = typeof input.companyName === "string" ? input.companyName.trim() : "";
    const jobTitle = typeof input.jobTitle === "string" ? input.jobTitle.trim() : "";
    const phone = typeof input.phone === "string" ? input.phone.trim() : "";
    const website = typeof input.website === "string" ? input.website.trim() : "";
    if (fullName.length < 2 || fullName.length > 120) throw new ApiError(400, "Enter your full name (2–120 characters).");
    if (companyName.length < 2 || companyName.length > 160) throw new ApiError(400, "Enter a company name (2–160 characters).");
    if (jobTitle.length < 2 || jobTitle.length > 120) throw new ApiError(400, "Enter your job title (2–120 characters).");
    if (phone.length < 7 || phone.length > 40) throw new ApiError(400, "Enter a valid contact phone number.");
    if (website && (!/^https:\/\//i.test(website) || website.length > 500)) throw new ApiError(400, "Enter a company website beginning with https://.");

    const admin = createAdminClient();
    const { data: buyer, error: buyerError } = await admin.from("buyer_profiles").select("id").eq("profile_id", user.id).maybeSingle();
    if (buyerError) throw new ApiError(503, "Unable to verify your buyer account.");
    if (!buyer) throw new ApiError(403, "A buyer profile is required.");
    const [{ error: userProfileError }, { error: buyerProfileError }] = await Promise.all([
      admin.from("profiles").update({ full_name: fullName, phone }).eq("id", user.id),
      admin.from("buyer_profiles").update({ company_name: companyName, job_title: jobTitle, phone, website: website || null, updated_at: new Date().toISOString() }).eq("id", buyer.id),
    ]);
    if (userProfileError || buyerProfileError) throw new ApiError(503, "Unable to save your buyer profile. Please try again.");
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiFailure(error);
  }
}
