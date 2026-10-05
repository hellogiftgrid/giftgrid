import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPostStats } from "@/lib/community/reactions";

type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to like a post." }, { status: 401 });
  let input;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof input?.liked !== "boolean") return NextResponse.json({ error: "Choose like or unlike." }, { status: 400 });
  const { data: post } = await supabase.from("community_posts").select("id").eq("id", id).eq("status", "published").maybeSingle();
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  const result = input.liked
    ? await supabase.from("community_likes").upsert({ post_id: id, member_id: user.id }, { onConflict: "post_id,member_id", ignoreDuplicates: true })
    : await supabase.from("community_likes").delete().eq("post_id", id).eq("member_id", user.id);
  if (result.error) return NextResponse.json({ error: "Unable to update your like." }, { status: 500 });
  return NextResponse.json({ stats: (await getPostStats([id], user.id))[0] });
}
