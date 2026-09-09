import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 30), 1), 50);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id,author_name,topic,body,created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: "Could not load community posts." }, { status: 500 });
  return NextResponse.json({ posts: data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to publish a community post." }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const input = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const text = typeof input.body === "string" ? input.body.trim() : "";
  const topic = typeof input.topic === "string" ? input.topic.trim() : "General";
  if (text.length < 1 || text.length > 2000) return NextResponse.json({ error: "Write between 1 and 2,000 characters." }, { status: 400 });
  if (topic.length < 1 || topic.length > 40) return NextResponse.json({ error: "Choose a shorter topic." }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", user.id).maybeSingle();
  const authorName = (profile?.full_name || profile?.email || "GiftGrid member").trim().slice(0, 120);
  const { data, error } = await supabase.from("community_posts").insert({ author_id: user.id, author_name: authorName, topic, body: text }).select("id,author_name,topic,body,created_at").single();
  if (error) return NextResponse.json({ error: "Could not publish your post." }, { status: 500 });
  return NextResponse.json({ post: data }, { status: 201 });
}
