import { NextResponse } from "next/server";
import { getShopCatalog } from "@/lib/shop/catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = (url.searchParams.get("category") || "").slice(0,128);
  const page = Math.max(1,Math.min(10000,Math.floor(Number(url.searchParams.get("page")) || 1)));
  try { return NextResponse.json(await getShopCatalog(category,page), { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "The shop is temporarily unavailable." }, { status: 503 }); }
}
