import Link from "next/link";

const sections: Record<string, { title: string; description: string; items: string[] }> = {
  apps: { title: "Apps / Projects", description: "Create isolated workspaces for every integration you build.", items: ["App registration and status", "Sandbox and production environments", "Per-app scopes and monitoring"] },
  sandbox: { title: "Sandbox", description: "Test against isolated data before requesting production access.", items: ["Test API keys", "Webhook delivery simulator", "Chatbot and automation playground"] },
  keys: { title: "API keys", description: "Credentials are scoped to an app and environment.", items: ["Create and revoke keys", "Read-only and write scopes", "Expiration and last-used tracking"] },
  webhooks: { title: "Webhooks", description: "Configure signed event delivery for each app.", items: ["Endpoint and event selection", "Signing secrets", "Delivery attempts and replay protection"] },
  cron: { title: "Cron jobs", description: "Schedule recurring jobs for your GiftGrid integration.", items: ["Schedules and timezones", "Run history and failures", "Pause, resume, and manual run"] },
  usage: { title: "Usage & logs", description: "Monitor requests, limits, errors, and AI safety signals.", items: ["Request and error logs", "Rate-limit visibility", "AI monitoring and suspension events"] },
};

export default async function ConsoleSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const content = sections[section] || { title: "Developer console", description: "This console area is being prepared.", items: ["Return to the overview to see available tools."] };
  return <div className="mx-auto max-w-4xl space-y-8"><Link href="/console" className="text-sm text-indigo-300 hover:text-indigo-200">← Console overview</Link><section><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Developer workspace</p><h1 className="mt-3 text-4xl font-bold">{content.title}</h1><p className="mt-4 max-w-2xl leading-7 text-slate-400">{content.description}</p></section><section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><h2 className="font-semibold">Included controls</h2><ul className="mt-4 space-y-3">{content.items.map((item) => <li key={item} className="flex gap-3 text-sm text-slate-300"><span className="text-indigo-300">◆</span>{item}</li>)}</ul><p className="mt-6 border-t border-white/10 pt-5 text-sm text-slate-500">Connect this area to the GiftGrid Developer API to manage live resources. See the <Link href="/console/docs" className="text-indigo-300 hover:underline">API documentation</Link> for the resource contract.</p></section></div>;
}
