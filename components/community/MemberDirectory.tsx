"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
type Member = { profile_id: string; display_name: string; kind: string; bio?: string; country?: string; avatar_url?: string; store_url?: string|null; product?: { title:string; short_description:string; hero_image_url:string|null; price_range:string|null; minimum_order_quantity:number }|null; follower_count?: number; merchant_id?: string|null; rank?: number|null };
export default function MemberDirectory({ merchantsOnly = false }: { merchantsOnly?: boolean }) {
  const [members, setMembers] = useState<Member[]>([]), [search, setSearch] = useState(""), [message, setMessage] = useState("Loading members...");
  const [following, setFollowing] = useState<string[]>([]), [userId, setUserId] = useState(""), [onlyFollowing, setOnlyFollowing] = useState(false), [busy, setBusy] = useState(""), [needsLogin, setNeedsLogin] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/community/members", { cache: "no-store" }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (active) { setMembers(result.members || []); setMessage(""); }
    }).catch(error => { if (active) setMessage(error.message); });
    fetch("/api/community/follows", { cache: "no-store" }).then(async response => { if (response.ok) { const result = await response.json(); if (active) { setFollowing(result.following || []); setUserId(result.userId); } } }).catch(() => {});
    return () => { active = false; };
  }, []);
  const visible = members.filter(member => (!merchantsOnly || member.kind === "merchant") && (!onlyFollowing || following.includes(member.profile_id)) && [member.display_name, member.bio || "", member.country || ""].join(" ").toLowerCase().includes(search.toLowerCase()));
  const ranked = [...visible].sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9) || (b.follower_count || 0) - (a.follower_count || 0));
  const strip = ranked.length > 15 ? [...ranked].sort(() => Math.random() - 0.5) : ranked;
  async function toggleFollow(member:Member) {
    const wasFollowing=following.includes(member.profile_id);setBusy(member.profile_id);setNeedsLogin(false);
    try{const response=await fetch("/api/community/follows",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({targetId:member.profile_id,following:!wasFollowing})});const data=await response.json();if(response.status===401)setNeedsLogin(true);if(!response.ok)throw new Error(data.error||"Unable to update your follow.");setFollowing(current=>wasFollowing?current.filter(id=>id!==member.profile_id):[...current,member.profile_id]);setMembers(current=>current.map(row=>row.profile_id===member.profile_id?{...row,follower_count:Math.max(0,(row.follower_count||0)+(wasFollowing?-1:1))}:row));}
    catch(error){setMessage(error instanceof Error?error.message:"Unable to update your follow.");}finally{setBusy("");}
  }
  async function startMessage(member:Member) {
    setBusy(member.profile_id);setNeedsLogin(false);
    try{const response=await fetch("/api/community/connections",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({targetId:member.profile_id})});const data=await response.json();if(response.status===401)setNeedsLogin(true);if(!response.ok)throw new Error(data.error||"Unable to open messages.");window.location.assign(`/messages?conversation=${encodeURIComponent(data.connection.id)}`);}
    catch(error){setMessage(error instanceof Error?error.message:"Unable to open messages.");}finally{setBusy("");}
  }
  return <section className="space-y-4">
    <p className="text-sm text-slate-500">{merchantsOnly ? "Every registered merchant with an active GiftGrid profile." : "Meet the community. Profiles are visible even while members complete their store setup."}</p>
    <div className="flex gap-2"><button type="button" aria-pressed={!onlyFollowing} onClick={()=>setOnlyFollowing(false)} className={`rounded-lg px-4 py-3 text-sm font-semibold ${!onlyFollowing?"bg-blue-600 text-white":"border border-slate-200 bg-white"}`}>{merchantsOnly?"All listed merchants":"Discover people"}</button><button type="button" aria-pressed={onlyFollowing} onClick={()=>setOnlyFollowing(true)} className={`rounded-lg px-4 py-3 text-sm font-semibold ${onlyFollowing?"bg-blue-600 text-white":"border border-slate-200 bg-white"}`}>Following ({following.length})</button></div>
    <label className="block text-sm font-semibold">{merchantsOnly ? "Find a merchant" : "Find a member"}<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, country or introduction" className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3" /></label>
    {message && <p role="status">{message}{needsLogin&&<> <Link href="/auth/sign-in?next=/connect" className="font-semibold text-blue-700 underline">Sign in</Link></>}</p>}
    {(() => { const card = (member: Member) => (
      <article key={member.profile_id} className="min-w-[280px] snap-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">{member.avatar_url ? <img src={member.avatar_url} alt="" className="size-12 rounded-full object-cover" /> : <span className="flex size-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{member.display_name.slice(0, 1)}</span>}<div className="min-w-0"><h2 className="break-words font-bold"><Link href={"/merchant/" + member.profile_id}>{member.display_name}</Link></h2><p className="text-xs capitalize text-slate-500">{member.kind}{member.country ? " / " + member.country : ""}</p></div></div>
      <p className="my-4 whitespace-pre-wrap break-words text-sm text-slate-600">{member.bio || "GiftGrid community member"}</p>
      {merchantsOnly && member.product && <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">{member.product.hero_image_url && <img src={member.product.hero_image_url} alt={member.product.title} className="mb-3 h-36 w-full rounded-lg bg-white object-contain"/>}<p className="font-semibold text-slate-900">{member.product.title}</p><p className="mt-1 line-clamp-2 text-xs text-slate-600">{member.product.short_description}</p><p className="mt-2 text-xs font-semibold text-slate-500">MOQ {member.product.minimum_order_quantity}{member.product.price_range ? ` · ${member.product.price_range}` : ""}</p></div>}
      <div className="mt-3 flex flex-wrap items-start gap-2"><Link href={"/merchant/" + member.profile_id} aria-label="View profile" className="group relative flex min-h-11 items-center rounded-lg border border-slate-200 p-2 text-sm font-semibold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg><span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">View profile</span></Link>{member.profile_id!==userId&&<><button type="button" disabled={busy===member.profile_id} aria-pressed={following.includes(member.profile_id)} onClick={()=>{void toggleFollow(member);}} className="group relative flex min-h-11 items-center rounded-lg bg-blue-600 p-2 text-sm font-bold text-white disabled:opacity-50" aria-label={following.includes(member.profile_id)?"Unfollow":"Follow"}>{following.includes(member.profile_id)?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-5"><path d="M5 13l4 4L19 7"/></svg>:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-5"><path d="M12 5v14M5 12h14"/></svg>}<span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">{following.includes(member.profile_id)?"Unfollow":"Follow"}</span></button><button type="button" disabled={busy===member.profile_id} onClick={()=>{void startMessage(member);}} className="group relative flex min-h-11 items-center rounded-lg border border-slate-200 p-2 text-sm font-semibold disabled:opacity-50" aria-label="Message"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">Message</span></button></>}</div>
    </article>
    ); return merchantsOnly
      ? <div className="flex gap-4 overflow-x-auto snap-x pb-3">{strip.map(card)}</div>
      : <div className="grid gap-4 sm:grid-cols-2">{visible.map(card)}</div>; })()}
    {!message && !visible.length && <p className="rounded-xl bg-white p-6 text-sm">No members match this view. Try another name or country.</p>}
  </section>;
}
