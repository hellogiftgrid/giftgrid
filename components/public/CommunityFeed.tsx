"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/use-session";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import PostCard, { type CommunityPost as Post } from "@/components/community/PostCard";


import MediaUpload from "@/components/community/MediaUpload";

export default function CommunityFeed() {
  const { signedIn, loading: authLoading } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");
  const [imagePath,setImagePath]=useState("");
  const [imageUrl,setImageUrl]=useState("");
  const [publishing,setPublishing]=useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    try {
    const sharedPost = new URLSearchParams(window.location.search).get("post");
    const response = await fetch("/api/community/posts" + (sharedPost ? "?post=" + encodeURIComponent(sharedPost) : ""), { cache: "no-store", signal: AbortSignal.timeout(20000) });
    const result = await response.json();
    if (!response.ok || !Array.isArray(result.posts)) throw new Error("Unable to load community posts. Please try again.");
    if (version === requestVersion.current) { setPosts(result.posts.filter((post:Post)=>post.topic!=="Buyer request")); setLoadError(""); }
    } catch {
      if (version === requestVersion.current) setLoadError("We couldn't refresh the community. Your existing posts are still shown. Check your connection and try again.");
    } finally { if (version === requestVersion.current) setLoading(false); }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => { void load(); }, 0);
    const timer = window.setInterval(() => { void load(); }, 30000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); requestVersion.current++; };
  }, [load, signedIn]);
  useEffect(() => {
    const update = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; stats: Pick<Post, 'liked' | 'like_count' | 'comment_count'> }>).detail;
      if (!detail?.id || !detail.stats) return;
      requestVersion.current++;
      setPosts(current => current.map(post => post.id === detail.id ? { ...post, ...detail.stats } : post));
    };
    window.addEventListener('giftgrid:post-updated', update);
    return () => window.removeEventListener('giftgrid:post-updated', update);
  }, []);

  async function publish(event: FormEvent) {
    event.preventDefault();
    if (publishing || !body.trim()) return;
    setMessage(""); setPublishing(true);
    try {
    const response = await fetch("/api/community/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body, topic, imagePath:imagePath || undefined }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || "Could not publish your post."); return; }
    requestVersion.current++;
    setLoading(false);
    setPosts((current) => [result.post, ...current.filter(post => post.id !== result.post.id)]); setBody("");setImagePath("");setImageUrl(""); setMessage("Posted to the community.");
    } catch {setMessage("Unable to publish. Please try again.");} finally {setPublishing(false);}
  }

  return <section className="border-y border-slate-200 bg-[#f0f2f5]"><div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,640px)_240px] lg:justify-center">

      <div id="feed" className="min-w-0 space-y-6">
        
        {loadError && <div role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><p>{loadError}</p><button type="button" onClick={() => { void load(); }} className="mt-2 min-h-11 font-bold underline">Try again</button></div>}
        <div className="mb-5"><h2 className="text-2xl font-bold tracking-tight text-slate-950">Community</h2><p className="mt-1 text-sm text-slate-500">Where gifting buyers meet merchants who can deliver.</p><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Buyers post gifting requests. Signed-in merchants can read the full brief and respond with products, pricing and lead times.</p></div>
        {signedIn ? <form onSubmit={publish} className="rounded-xl bg-white p-4 shadow-sm"><div className="flex gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">G</div><input value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} placeholder="What’s on your mind?" className="min-w-0 flex-1 rounded-full bg-[#f0f2f5] px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-200" /></div><p className="mt-3 text-xs text-slate-500">Your name and photo appear with your post. Account contact details remain private.</p><div className="mt-3"><MediaUpload onUploaded={(path,url)=>{setImagePath(path);setImageUrl(url);}}/></div>{imageUrl && <div className="mt-3"><img src={imageUrl} alt="Photo preview" className="max-h-72 w-full rounded-lg object-contain"/><button type="button" onClick={()=>{setImagePath("");setImageUrl("");}} className="mt-2 text-sm text-blue-600">Remove photo</button></div>}<div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><select value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-lg border-0 bg-transparent px-2 py-2 text-xs font-semibold text-slate-500 outline-none"><option>General</option><option>Packaging</option><option>Gifting ideas</option><option>Introductions</option><option>Operations</option></select><button disabled={publishing} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">{publishing ? "Publishing?" : "Post"}</button></div>{message && <p className="mt-2 text-xs text-slate-500">{message}</p>}</form> : <div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-600">{authLoading ? "Checking your account..." : "Sign in to share a post, like, comment, and connect with the community."}</p>{!authLoading && <Link href="/auth/sign-in?next=/" className="mt-3 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white">Sign in to post</Link>}</div>}
        <div className="mt-5 space-y-4">{loading ? <p className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">Loading posts…</p> : posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <p className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">No posts yet. Start the first conversation.</p>}</div>
      </div>
      <aside className="hidden space-y-4 lg:block lg:sticky lg:top-24"><div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-sm font-bold text-slate-950">People you may know</p><p className="mt-2 text-xs leading-5 text-slate-500">Buyers post quantities, budgets, dates and preferences. Approved merchants respond with a product, minimum order and lead time.</p></div><div className="rounded-xl bg-white p-4 text-xs leading-5 text-slate-400 shadow-sm"><div className="rounded-xl bg-white p-4 shadow-sm">
<a href="/app" className="inline-block py-3 text-sm font-semibold text-blue-700">Get the GiftGrid App</a></div>
        <div className="rounded-xl bg-white p-4 text-xs leading-5 text-slate-400 shadow-sm">GiftGrid Community · Keep conversations practical and respectful.</div></div></aside>
    </div>
  </div></section>;
}
