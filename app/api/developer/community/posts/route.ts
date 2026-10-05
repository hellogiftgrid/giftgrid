import { NextResponse } from "next/server";
import { apiFailure, jsonInput } from "@/lib/developer/api";
import { publishingActor, publishPost } from "@/lib/community/publishing";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const actor = await publishingActor(request, "community:publish");
    const result = await publishPost(actor, await jsonInput(request), request.headers.get("idempotency-key"));
    return NextResponse.json(result, { status: result.replayed ? 200 : 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiFailure(error); }
}
