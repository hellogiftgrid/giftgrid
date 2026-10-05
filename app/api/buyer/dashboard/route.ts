import { NextResponse } from "next/server";
import { ApiError, apiFailure } from "@/lib/developer/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Sign in to open your buyer dashboard.");

    const admin = createAdminClient();
    const { data: buyerRecord, error: buyerError } = await admin
      .from("buyer_profiles")
      .select("id,company_name,status,job_title,phone,website")
      .eq("profile_id", user.id)
      .maybeSingle();
    if (buyerError) throw new ApiError(503, "Unable to load your buyer profile.");
    if (!buyerRecord) throw new ApiError(404, "Your buyer profile was not found.");
    const { data: publicProfile, error: profileError } = await admin.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    if (profileError) throw new ApiError(503, "Unable to load your account details.");
    const buyer = { ...buyerRecord, full_name: publicProfile?.full_name || null, profile_complete: Boolean(publicProfile?.full_name?.trim() && buyerRecord.company_name?.trim() && buyerRecord.job_title?.trim() && buyerRecord.phone?.trim()) };

    const [listingResult, inquiryResult] = await Promise.all([
      admin.from("shop_visible_listings")
        .select("id,merchant_id,title,short_description,hero_image_url,category,minimum_order_quantity,price_range,lead_time,customization_available,merchant_profiles(business_name,avatar_url)")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false }),
      admin.from("buyer_inquiries")
        .select("id,subject,status,created_at,merchant_profiles(business_name)")
        .eq("buyer_id", buyer.id)
        .order("created_at", { ascending: false }),
    ]);
    if (listingResult.error || inquiryResult.error) {
      throw new ApiError(503, "Unable to load the buyer catalog or your inquiries.");
    }

    return NextResponse.json({
      buyer,
      listings: listingResult.data || [],
      inquiries: inquiryResult.data || [],
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return apiFailure(error);
  }
}
