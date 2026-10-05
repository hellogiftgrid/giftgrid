import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPendingActivityNotifications } from "@/lib/email/activity-reports";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("community_comments").select("id,author_name,body,created_at").eq("post_id", id).eq("status", "published").order("created_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: "Unable to load comments." }, { status: 500 });
  return NextResponse.json({ comments: data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  let input;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const body = typeof input?.body === "string" ? input.body.trim() : "";
  if (!body || body.length > 1500) return NextResponse.json({ error: "Write a comment of 1–1,500 characters." }, { status: 400 });
  const { data: post, error: postError } = await supabase.from("community_posts").select("id").eq("id", id).eq("status", "published").maybeSingle();
  if (postError) return NextResponse.json({ error: "Unable to check this post." }, { status: 503 });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const name = profile?.full_name?.trim().slice(0,120) || "GiftGrid member";
  const authorName = name.includes('@') ? 'GiftGrid member' : name;
  const { data, error } = await supabase.from("community_comments").insert({ post_id: id, author_id: user.id, author_name: authorName, body }).select("id,author_name,body,created_at").single();
  if (error) return NextResponse.json({ error: "Unable to publish your comment." }, { status: 400 });
  try { await sendPendingActivityNotifications(); } catch { /* The queued email will be retried by the nightly job. */ }
  return NextResponse.json({ comment: data }, { status: 201 });
}
