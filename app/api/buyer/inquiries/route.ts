import { NextResponse } from "next/server";
import { ApiError, apiFailure, jsonInput, uuid } from "@/lib/developer/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendPendingActivityNotifications } from "@/lib/email/activity-reports";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Sign in to send an inquiry.");

    const input = await jsonInput(request);
    const listingId = typeof input.listingId === "string" ? input.listingId : "";
    const subject = typeof input.subject === "string" ? input.subject.trim() : "";
    const message = typeof input.message === "string" ? input.message.trim() : "";
    const quantityText = typeof input.quantity === "string" ? input.quantity.trim() : "";
    const targetDate = typeof input.targetDate === "string" ? input.targetDate.trim() : "";
    const budget = typeof input.budget === "string" ? input.budget.trim() : "";

    if (!uuid(listingId)) throw new ApiError(400, "Choose a valid product listing.");
    if (subject.length < 2 || subject.length > 160) throw new ApiError(400, "Enter a subject between 2 and 160 characters.");
    if (!message || message.length > 4000) throw new ApiError(400, "Add a message of up to 4,000 characters.");

    let quantity: number | null = null;
    if (quantityText) {
      quantity = Number(quantityText);
      if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000000) {
        throw new ApiError(400, "Enter a whole-number quantity greater than zero.");
      }
    }

    let validatedDate: string | null = null;
    if (targetDate) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(targetDate);
      const date = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : null;
      if (!date || date.toISOString().slice(0, 10) !== targetDate) {
        throw new ApiError(400, "Choose a valid target date.");
      }
      validatedDate = targetDate;
    }

    if (budget && !/^(USD|CAD|GBP|EUR) [1-9]\d{0,8}\.\d{2}$/.test(budget)) {
      throw new ApiError(400, "Enter a positive budget amount in USD, CAD, GBP, or EUR.");
    }

    const admin = createAdminClient();
    const { data: buyer, error: buyerError } = await admin
      .from("buyer_profiles")
      .select("id,status,company_name,job_title,phone")
      .eq("profile_id", user.id)
      .maybeSingle();
    if (buyerError) throw new ApiError(503, "Unable to verify your buyer account.");
    if (!buyer) throw new ApiError(403, "A buyer profile is required to send an inquiry.");
    if (buyer.status !== "approved") throw new ApiError(403, "Your buyer account must be approved before sending an inquiry.");
    const { data: buyerIdentity, error: identityError } = await admin.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    if (identityError) throw new ApiError(503, "Unable to verify your buyer profile.");
    if (!buyerIdentity?.full_name?.trim() || !buyer.company_name?.trim() || !buyer.job_title?.trim() || !buyer.phone?.trim()) {
      throw new ApiError(403, "Complete your buyer profile in the dashboard before sending an inquiry.");
    }

    const { data: listing, error: listingError } = await admin
      .from("shop_visible_listings")
      .select("id,merchant_id")
      .eq("id", listingId)
      .maybeSingle();
    if (listingError) throw new ApiError(503, "Unable to verify this product listing.");
    if (!listing) throw new ApiError(404, "This product is no longer available for inquiries.");

    const { data: inquiry, error: inquiryError } = await admin
      .from("buyer_inquiries")
      .insert({
        buyer_id: buyer.id,
        merchant_id: listing.merchant_id,
        listing_id: listing.id,
        subject,
        message,
        quantity,
        target_date: validatedDate,
        budget: budget || null,
      })
      .select("id,subject,status,created_at")
      .single();
    if (inquiryError || !inquiry) throw new ApiError(503, "We couldn’t send your inquiry. Please try again.");

    try { await sendPendingActivityNotifications(); } catch { /* The queued email will be retried by the nightly job. */ }

    return NextResponse.json({ inquiry }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiFailure(error);
  }
}
