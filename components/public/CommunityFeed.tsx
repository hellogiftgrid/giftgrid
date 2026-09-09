"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Post = { id: string; author_name: string; topic: string; body: string; created_at: string };

function age(value: string) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}

function NavIcon({ kind }: { kind: "community" | "merchants" | "connect" | "profile" }) {
  const paths = { community: "M4 5h16v12H7l-3 3V5Zm4 4h8M8 12h5", merchants: "M3 9h18M5 9v10h14V9M8 9V5h8v4", connect: "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM11 9l2 2", profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d={paths[kind]} /></svg>;
}

function ConsoleIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4zM8 9l3 3-3 3m5 0h3" /></svg>;
}

export default function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/community/posts", { cache: "no-store" });
    if (response.ok) setPosts((await response.json()).posts || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); const timer = window.setInterval(load, 15000); return () => window.clearInterval(timer); }, [load]);

  async function publish(event: FormEvent) {
    event.preventDefault(); setMessage("");
    const response = await fetch("/api/community/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body, topic }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || "Could not publish your post."); return; }
    setPosts((current) => [result.post, ...current]); setBody(""); setMessage("Posted to the community.");
  }

  return <section className="border-y border-slate-200 bg-[#f0f2f5]"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
    <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,640px)_220px] lg:justify-center">
      <aside className="hidden space-y-2 lg:block lg:sticky lg:top-24"><div className="rounded-xl bg-white p-3 shadow-sm"><p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-slate-400">GiftGrid</p>{[["community","Community","/community"],["merchants","Merchants","/buyers/apply"],["connect","Connect","/contact"],["profile","Profile","/dashboard/profile"]].map(([kind,label,href]) => <a key={kind} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#f0f2f5]"><NavIcon kind={kind as "community" | "merchants" | "connect" | "profile"} /><span>{label}</span></a>)}<a href="/console" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#f0f2f5]"><ConsoleIcon /><span>Console</span></a></div></aside>
      <div id="feed" className="min-w-0">
        <div className="mb-5"><h2 className="text-2xl font-bold tracking-tight text-slate-950">Community</h2><p className="mt-1 text-sm text-slate-500">See what members are sharing.</p></div>
        <form onSubmit={publish} className="rounded-xl bg-white p-4 shadow-sm"><div className="flex gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">G</div><input value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} placeholder="What’s on your mind?" className="min-w-0 flex-1 rounded-full bg-[#f0f2f5] px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-200" /></div><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><select value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-lg border-0 bg-transparent px-2 py-2 text-xs font-semibold text-slate-500 outline-none"><option>General</option><option>Packaging</option><option>Gifting ideas</option><option>Introductions</option><option>Operations</option></select><button className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">Post</button></div>{message && <p className="mt-2 text-xs text-slate-500">{message}</p>}</form>
        <div className="mt-5 space-y-4">{loading ? <p className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">Loading posts…</p> : posts.length ? posts.map((post) => <article key={post.id} className="rounded-xl bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{post.author_name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="font-bold text-slate-950">{post.author_name}</p><p className="text-xs text-slate-400">{age(post.created_at)}</p></div></div><p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{post.body}</p><div className="mt-4 flex gap-2 border-t border-slate-100 pt-3"><button type="button" className="flex-1 rounded-lg py-2 text-sm font-semibold text-slate-500 hover:bg-[#f0f2f5]">Like</button><button type="button" className="flex-1 rounded-lg py-2 text-sm font-semibold text-slate-500 hover:bg-[#f0f2f5]">Comment</button><span className="px-3 py-2 text-xs text-slate-400">{post.topic}</span></div></article>) : <p className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">No posts yet. Start the first conversation.</p>}</div>
      </div>
      <aside className="hidden space-y-4 lg:block lg:sticky lg:top-24"><div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-sm font-bold text-slate-950">People you may know</p><p className="mt-2 text-xs leading-5 text-slate-500">New merchant and gifting conversations will appear here as the community grows.</p></div><div className="rounded-xl bg-white p-4 text-xs leading-5 text-slate-400 shadow-sm"><div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-950">Get the GiftGrid app</p>
          <p className="mt-1 text-xs text-slate-500">Community and merchant tools on mobile.</p>
          <div className="mt-3 flex flex-col gap-2">
            <a href="https://apps.apple.com/app/giftgrid/YOUR_APP_ID"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              🍎 App Store
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.hellogiftgrid.app"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              ▶ Google Play
            </a>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 text-xs leading-5 text-slate-400 shadow-sm">GiftGrid Community · Keep conversations practical and respectful.</div></div></aside>
    </div>
  </div></section>;
}
