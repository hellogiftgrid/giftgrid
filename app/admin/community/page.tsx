import DeleteCommunityItemButton from "@/components/admin/DeleteCommunityItemButton";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  const admin = createAdminClient();
  const [postsResult, buyerPostsResult, requestsResult] = await Promise.all([
    admin.from("community_posts").select("id,author_name,topic,body,created_at,image_url,system_key").eq("status", "published").order("created_at", { ascending: false }).limit(250),
    admin.from("community_posts").select("system_key").eq("status", "published").eq("topic", "Buyer request").like("system_key", "buyer-request:%").order("created_at", { ascending: false }).limit(5000),
    admin.from("community_posts").select("system_key,body,created_at").eq("status", "hidden").like("system_key", "buyer-request-private:%").order("created_at", { ascending: false }).limit(250),
  ]);
  const postError = postsResult.error;
  const posts = (postsResult.data || []).filter(post => !post.system_key?.startsWith("buyer-request:"));
  const requestIds = new Set((buyerPostsResult.data || []).flatMap(post => {
    const key = post.system_key || "";
    return key.startsWith("buyer-request:") ? [key.slice("buyer-request:".length)] : [];
  }));
  const requests = (requestsResult.data || []).flatMap(row => {
    const key = row.system_key || "";
    const id = key.slice("buyer-request-private:".length);
    if (!requestIds.has(id)) return [];
    let brief: Record<string, unknown> = {};
    try {
      const parsed: unknown = JSON.parse(row.body);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) brief = parsed as Record<string, unknown>;
    } catch { /* Show a safe label if an older brief is malformed. */ }
    return [{ id, brief, created_at: row.created_at }];
  });

  return <div className="mx-auto max-w-5xl space-y-10">
    <header><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Moderation</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Community and sourcing posts</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Remove an individual post or sourcing request. Deleting a sourcing request also removes its private brief, merchant replies, and quote records.</p></header>
    {postError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load community posts: {postError.message}</p>}
    <section><h2 className="mb-4 text-xl font-bold text-slate-900">Community posts</h2><div className="space-y-3">{posts.map(post => <article key={post.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-xs font-semibold text-slate-500">{post.author_name} · {post.topic} · {new Date(post.created_at).toLocaleString()}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800">{post.body}</p>{post.image_url && <a className="mt-2 inline-block text-xs font-semibold text-blue-700 underline" href={post.image_url} target="_blank" rel="noreferrer">View attached image</a>}</div><DeleteCommunityItemButton id={post.id} kind="community_post" label="post" /></article>)}{!posts.length && !postError && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No community posts to moderate.</p>}</div></section>
    <section><h2 className="mb-4 text-xl font-bold text-slate-900">Sourcing requests</h2><div className="space-y-3">{requests.map(request => { const value = (key: string) => typeof request.brief[key] === "string" || typeof request.brief[key] === "number" ? String(request.brief[key]) : "Not provided"; return <article key={request.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-500">Open buyer request · {new Date(request.created_at).toLocaleString()}</p><h3 className="mt-2 text-lg font-bold text-slate-900">{value("title")}</h3><dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2"><div><dt className="font-semibold text-slate-500">Company</dt><dd className="mt-1 text-slate-800">{value("companyName")}</dd></div><div><dt className="font-semibold text-slate-500">Product type</dt><dd className="mt-1 text-slate-800">{value("category")}</dd></div><div><dt className="font-semibold text-slate-500">Quantity</dt><dd className="mt-1 text-slate-800">{value("quantity")}</dd></div><div><dt className="font-semibold text-slate-500">Budget</dt><dd className="mt-1 text-slate-800">{value("budget")}</dd></div><div><dt className="font-semibold text-slate-500">Needed by</dt><dd className="mt-1 text-slate-800">{value("neededBy")}</dd></div><div><dt className="font-semibold text-slate-500">Delivery region</dt><dd className="mt-1 text-slate-800">{value("deliveryRegion")}</dd></div><div><dt className="font-semibold text-slate-500">Customization</dt><dd className="mt-1 text-slate-800">{value("customization")}</dd></div></dl><div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Full request</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{value("details")}</p></div></div><DeleteCommunityItemButton id={request.id} kind="sourcing_request" label="request" /></article>; })}{!requests.length && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No open sourcing requests to moderate.</p>}</div></section>
  </div>;
}
