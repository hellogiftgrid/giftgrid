import { NextResponse } from "next/server";
import { apiFailure, jsonInput } from "@/lib/developer/api";
import { publishingActor, draftPost } from "@/lib/community/publishing";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    await publishingActor(request, "community:draft");
    const draft = await draftPost(await jsonInput(request));
    return NextResponse.json({ draft, published: false }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiFailure(error); }
}
