import Link from "next/link";
import { notFound } from "next/navigation";
import { developerDocs, getDeveloperDoc } from "@/lib/docs/developer-docs";

export function generateStaticParams() { return developerDocs.map(([slug]) => ({ slug })); }

export default async function DeveloperDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDeveloperDoc(slug);
  if (!doc) notFound();
  const [, title, description] = doc;
  return <article className="mx-auto max-w-4xl"><Link href="/console/docs" className="text-sm text-indigo-300 hover:text-indigo-200">← All docs</Link><p className="mt-10 text-xs font-bold uppercase tracking-[.2em] text-indigo-300">GiftGrid developer docs</p><h1 className="mt-3 text-4xl font-bold">{title}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">{description}</p>{slug === "automations" || slug === "community" ? <AutomationGuide communityOnly={slug === "community"} /> : <div className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/[.04] p-7 text-sm leading-7 text-slate-300"><p>Use the GiftGrid routes and scopes documented in this repository. Register an app in Console and create a narrowly scoped API key. Keep the key in a server-side secret store, send JSON over HTTPS, and treat supplied data as untrusted input.</p><p>Do not assume sandbox routes, outbound webhook delivery, or rate-limit headers are available unless GiftGrid documents them for your account. Never place API keys in browser bundles, mobile source code, screenshots, or public repositories.</p></div>}</article>;
}

function AutomationGuide({ communityOnly }: { communityOnly: boolean }) {
  return <div className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/[.04] p-7 text-sm leading-7 text-slate-300">
    <p>Connect n8n, Make, or Zapier using its standard HTTP request action. Register an app in Console → Apps, then create an API key with only the <code>community:publish</code> scope. Publishing also requires an active account with developer, admin, or super-admin access and an administrator-enabled GiftGrid profile UUID.</p>
    {!communityOnly && <p>Posts appear under the real account that owns the API key; integrations cannot impersonate members. Automated publishing is limited to three posts per account in any 24 hours, with at least four hours between posts. The API creates posts only. It does not automate likes, comments, follows, or messages.</p>}
    <p>Set an HTTPS POST to <code>https://www.degiftgrid.com/api/developer/community/posts</code>. Store the Authorization header in your automation service’s encrypted credentials. Include a stable, unique event ID in <code>Idempotency-Key</code> so retries cannot create duplicate posts.</p>
    <pre className="overflow-x-auto rounded-xl bg-slate-950 p-5 text-xs text-indigo-200"><code>{`POST /api/developer/community/posts
Authorization: Bearer <API_KEY>
Content-Type: application/json
Idempotency-Key: <stable-unique-event-id>

{"topic":"Business gifting","body":"Your approved, factual post text."}`}</code></pre>
    <p>In n8n, use an HTTP Request node and map the execution ID or source-record ID to the idempotency header. In Make, use HTTP → Make a request and map the trigger’s unique record ID. In Zapier, use Webhooks by Zapier → Custom Request and map the trigger record’s ID. In all three, use the platform’s credential store for the key and suppress sensitive request headers in execution logs.</p>
    <p>The post body accepts up to 2,000 characters and the optional topic up to 40. Repeating an idempotency key with identical content returns the original post; changing content with a reused key returns HTTP 409. A schedule limit returns HTTP 429. Stop and wait instead of retrying rapidly. GiftGrid does not deliver registered outbound webhooks in this release.</p>
    {communityOnly && <p>AI drafting uses the separate <code>community:draft</code> scope and does not publish. Route drafts to a human review step first. Do not automate invented testimonials, product claims, comments, or activity attributed to other people.</p>}
    <p>If publishing is not enabled for the account, ask the GiftGrid administrator to review the app and enable its real profile. Do not work around this gate by creating extra member identities.</p>
  </div>;
}
