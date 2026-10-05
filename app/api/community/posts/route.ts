import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPostStats } from "@/lib/community/reactions";
import { ownedCommunityImage } from "@/lib/community/members";
import { withAuthorAvatars } from "@/lib/community/avatars";
import { apiFailure } from "@/lib/developer/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit") || 30);
  if (!Number.isFinite(requestedLimit)) return NextResponse.json({ error: "Invalid post limit." }, { status: 400 });
  const limit = Math.min(Math.max(Math.trunc(requestedLimit), 1), 50);
  const supabase = await createClient();
  let query = supabase
    .from("community_posts")
    .select("id,author_id,author_name,image_url,topic,body,created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  const postId = url.searchParams.get("post");
  if (postId) {
    if (!/^[0-9a-f-]{36}$/i.test(postId)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });
    query = query.eq("id",postId);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Could not load community posts." }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  const stats = new Map((await getPostStats((data || []).map(post=>post.id),user?.id || null)).map(item=>[item.post_id,item]));
  return NextResponse.json({ posts: await withAuthorAvatars((data || []).map(post=>({...post,...stats.get(post.id)}))) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Unable to refresh the community. Please try again." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
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
  let imageUrl: string | null = null;
  if (input.imagePath) {
    try { imageUrl = await ownedCommunityImage(input.imagePath,user.id); } catch(error) { return apiFailure(error); }
  }
  if (text.length < 1 || text.length > 2000) return NextResponse.json({ error: "Write between 1 and 2,000 characters." }, { status: 400 });
  if (topic.length < 1 || topic.length > 40) return NextResponse.json({ error: "Choose a shorter topic." }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const authorName = (profile?.full_name || "GiftGrid member").trim().slice(0, 120);
  const { data, error } = await supabase.from("community_posts").insert({ author_id: user.id, author_name: authorName, image_url:imageUrl, topic, body: text }).select("id,author_id,author_name,image_url,topic,body,created_at").single();
  if (error) return NextResponse.json({ error: "Could not publish your post." }, { status: 500 });
  return NextResponse.json({ post: (await withAuthorAvatars([data]))[0] }, { status: 201 });
}
