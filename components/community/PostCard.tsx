"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

export type CommunityPost = { id: string; author_name: string; author_id?: string | null; author_avatar_url?: string | null; image_url?: string | null; topic: string; body: string; created_at: string; like_count?: number; comment_count?: number; liked?: boolean };
type Comment = { id: string; author_name: string; body: string; created_at: string };
function age(value: string) {
  const seconds = Math.max(1,Math.round((Date.now()-new Date(value).getTime())/1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds/60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds/3600)}h ago`;
  return `${Math.round(seconds/86400)}d ago`;
}
export default function PostCard({ post }: { post: CommunityPost }) {
  const [stats,setStats] = useState({ liked: Boolean(post.liked), like_count: post.like_count || 0, comment_count: post.comment_count || 0 });
  const [open,setOpen] = useState(false);
  const [comments,setComments] = useState<Comment[]>([]);
  const [commentsLoading,setCommentsLoading] = useState(false);
  const [body,setBody] = useState("");
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState("");
  const [needsLogin,setNeedsLogin] = useState(false);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) setStats({ liked: Boolean(post.liked), like_count: post.like_count || 0, comment_count: post.comment_count || 0 }); });
    return () => { active = false; };
  },[post.liked,post.like_count,post.comment_count]);
  async function like() {
    if (busy) return;
    setBusy(true); setNotice(""); setNeedsLogin(false);
    try {
      const response = await fetch(`/api/community/posts/${post.id}/reactions`, { method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({liked:!stats.liked}) });
      const result = await response.json();
      if (response.status === 401) setNeedsLogin(true);
      if (!response.ok) throw new Error(result.error || "Unable to update your like.");
      setStats(result.stats);
      window.dispatchEvent(new CustomEvent('giftgrid:post-updated', { detail: { id: post.id, stats: result.stats } }));
    } catch(error) { setNotice(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function showComments() {
    if (open) { setOpen(false); return; }
    setOpen(true); setNotice(""); setCommentsLoading(true);
    try {
      const response = await fetch(`/api/community/posts/${post.id}/comments`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load comments.");
      setComments(result.comments || []);
    } catch(error) { setNotice(error instanceof Error ? error.message : "Please try again."); }
    finally { setCommentsLoading(false); }
  }
  async function comment(event: FormEvent) {
    event.preventDefault();
    if (!body.trim() || busy || commentsLoading) return;
    setBusy(true); setNotice(""); setNeedsLogin(false);
    try {
      const response = await fetch(`/api/community/posts/${post.id}/comments`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({body})});
      const result = await response.json();
      if (response.status === 401) setNeedsLogin(true);
      if (!response.ok) throw new Error(result.error || "Unable to publish your comment.");
      setComments(current => [result.comment,...current]); setBody(""); setStats(current=>({...current,comment_count:current.comment_count+1}));
      window.dispatchEvent(new CustomEvent('giftgrid:post-updated', { detail: { id: post.id, stats: { ...stats, comment_count: stats.comment_count + 1 } } }));
    } catch(error) { setNotice(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function share() {
    const url = `https://community.degiftgrid.com/?post=${post.id}`;
    try {
      if (navigator.share) await navigator.share({title:"GiftGrid Community",url});
      else { await navigator.clipboard.writeText(url); setNotice("Post link copied."); }
    } catch(error) { if (!(error instanceof DOMException && error.name === "AbortError")) setNotice("Unable to share. Please try again."); }
  }
  return <article id={`post-${post.id}`} className="min-w-0 rounded-xl bg-white p-4 shadow-sm sm:p-5">
    {post.topic === 'Demo' && <p className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">Demo activity · Fictional example, not a live offer or buyer request</p>}
    <div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{post.author_avatar_url ? <img src={post.author_avatar_url} alt="GiftGrid" className="size-10 rounded-full bg-white object-contain p-1" /> : post.author_name.slice(0,1).toUpperCase()}</div><div className="min-w-0"><p className="break-words font-bold text-slate-950">{post.author_name}</p><p className="text-xs text-slate-500">{age(post.created_at)} · {post.topic}</p></div></div>
    <p className="mt-4 break-words whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{post.body}</p>
    {post.image_url && <a href={post.image_url} target="_blank" rel="noreferrer" className="mt-4 block overflow-hidden rounded-xl"><img src={post.image_url} alt={`Photo shared by ${post.author_name}`} loading="lazy" className="max-h-[600px] w-full object-contain" /></a>}
    <p className="mt-4 text-xs text-slate-500">{stats.like_count} likes · {stats.comment_count} comments</p>
    <div className="mt-3 flex gap-1 border-t border-slate-100 pt-2">
      <button type="button" onClick={like} disabled={busy} aria-pressed={stats.liked} className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold disabled:opacity-50 ${stats.liked ? "text-blue-600" : "text-slate-500"}`}><ActionIcon kind="like" filled={stats.liked} />{stats.liked ? "Liked" : "Like"}</button>
      <button type="button" onClick={showComments} aria-expanded={open} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500"><ActionIcon kind="comment" />Comment</button>
      <button type="button" onClick={share} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500"><ActionIcon kind="share" />Share</button>
    </div>
    {notice && <p role="status" className="mt-3 text-sm text-slate-600">{notice}{needsLogin && <> <Link href={'/auth/sign-in?next=' + encodeURIComponent('/?post=' + post.id)} className="font-semibold text-blue-600 underline">Sign in</Link></>}</p>}
    {open && <section aria-label="Comments" className="mt-4 border-t border-slate-100 pt-4">
      <form onSubmit={comment} className="flex gap-2"><input aria-label="Write a comment" value={body} onChange={event=>setBody(event.target.value)} maxLength={1500} placeholder="Write a comment..." className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-3 text-sm" /><button disabled={busy || commentsLoading || !body.trim()} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Send</button></form>
      {commentsLoading && <p role="status" className="mt-3 text-sm text-slate-500">Loading comments...</p>}
      <div className="mt-4 space-y-3">{comments.map(comment => <div key={comment.id} className="rounded-xl bg-slate-50 p-3"><p className="text-sm font-bold text-slate-950">{comment.author_name}</p><p className="mt-1 break-words whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p></div>)}{!comments.length && <p className="text-sm text-slate-500">Be the first to comment.</p>}</div>
    </section>}
  </article>;
}

function ActionIcon({kind,filled=false}:{kind:"like"|"comment"|"share";filled?:boolean}) {
  const paths={like:"M7 10v11H3V10h4Zm0 1 5-8h2v5h5a2 2 0 0 1 2 2l-2 9a2 2 0 0 1-2 2H7",comment:"M21 11a8 8 0 0 1-8 8H7l-4 3V11a9 9 0 0 1 18 0Z",share:"M14 3l8 7-8 7v-5c-6 0-9 3-12 8 0-9 5-13 12-13V3Z"};
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="size-5 shrink-0"><path d={paths[kind]} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
