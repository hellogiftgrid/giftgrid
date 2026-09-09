import Link from "next/link";

const cards = [
  ["Apps / Projects", "Register multiple apps with isolated credentials and settings.", "/console/apps", "2 apps"],
  ["Sandbox", "Test requests, chatbots, automations, and webhooks with test data.", "/console/sandbox", "Ready"],
  ["API keys", "Create scoped sandbox and production credentials.", "/console/keys", "Manage"],
  ["Webhooks", "Deliver signed events to each app endpoint.", "/console/webhooks", "0 active"],
  ["Cron jobs", "Schedule recurring GiftGrid automations and monitor runs.", "/console/cron", "Configure"],
  ["Usage & logs", "Inspect requests, rate limits, errors, and AI monitoring signals.", "/console/usage", "View logs"],
];

const plans = [
  ["Starter", "2 apps · 3 cron jobs · daily schedules · 10k API requests/month"],
  ["Growth", "10 apps · 20 cron jobs · hourly schedules · 250k API requests/month"],
  ["Scale", "Unlimited apps · 100 cron jobs · 5-minute schedules · 2m API requests/month"],
];

export default function ConsoleOverview() {
  return <div className="mx-auto max-w-6xl space-y-10"><section><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">GiftGrid developer platform</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Build, test, and connect your app</h1><p className="mt-4 max-w-2xl leading-7 text-slate-400">A Groq-style project workspace for GiftGrid integrations. Every app has separate sandbox and production credentials, scopes, webhooks, cron jobs, and monitoring.</p></section><section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{cards.map(([title, description, href, status]) => <Link href={href} key={href} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-0.5 hover:border-indigo-300/50 hover:bg-white/[0.07]"><div className="flex items-start justify-between gap-4"><h2 className="font-semibold">{title}</h2><span className="rounded-full bg-indigo-400/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-200">{status}</span></div><p className="mt-3 text-sm leading-6 text-slate-400">{description}</p></Link>)}</section><section><div className="mb-4"><h2 className="text-xl font-semibold">Developer plans</h2><p className="mt-1 text-sm text-slate-400">Capacity is separate from your GiftGrid merchant or buyer status.</p></div><div className="grid gap-4 md:grid-cols-3">{plans.map(([name, detail]) => <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><h3 className="font-semibold">{name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p></div>)}</div></section><section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-6"><h2 className="font-semibold text-amber-100">Access and monitoring</h2><p className="mt-2 text-sm leading-6 text-slate-300">Production access follows your GiftGrid status and granted scopes. Chatbot and automation integrations are monitored by AI and may be suspended immediately for serious abuse or security risks.</p></section></div>;
}
