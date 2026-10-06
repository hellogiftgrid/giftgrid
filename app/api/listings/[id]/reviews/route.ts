import { NextResponse } from "next/server";
import { memberContext } from "@/lib/community/members";
import { ApiError, apiFailure, jsonInput, uuid } from "@/lib/developer/api";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    if (!uuid(id)) throw new ApiError(404, "Listing not found.");
    const { admin } = await memberContext();
    const { data, error } = await admin.from("listing_reviews").select("id,profile_id,rating,body,created_at").eq("listing_id", id).order("created_at", { ascending: false }).limit(100);
    if (error) throw new ApiError(503, "Unable to load reviews.");
    return NextResponse.json({ reviews: data || [] }, { headers: { "Cache-Control": "public, no-store" } });
  } catch (error) { return apiFailure(error); }
}

export async function POST(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    if (!uuid(id)) throw new ApiError(404, "Listing not found.");
    const { admin, user } = await memberContext();
    const input = await jsonInput(request);
    const rating = Number(input.rating);
    const body = typeof input.body === "string" ? input.body.trim().slice(0, 2000) : "";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, "Rate this product from 1 to 5.");
    const { data, error } = await admin.from("listing_reviews").upsert({ listing_id: id, profile_id: user.id, rating, body }, { onConflict: "listing_id,profile_id" }).select("id,profile_id,rating,body,created_at").single();
    if (error) throw new ApiError(503, "Unable to save your review.");
    return NextResponse.json({ review: data }, { status: 201 });
  } catch (error) { return apiFailure(error); }
}
