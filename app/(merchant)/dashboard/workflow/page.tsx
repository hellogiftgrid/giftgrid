"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
type Task = { id: string; title: string; detail: string; status: string; href: string };
const columns = [["todo", "To do"], ["in_progress", "In progress"], ["done", "Complete"]] as const;
export default function WorkflowPage() {
 const [tasks, setTasks] = useState<Task[]>([]), [enabled, setEnabled] = useState(true), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState("");
 const load = useCallback(async () => {
  try { const response = await fetch("/api/merchant/workflow", { cache: "no-store" }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setTasks(data.tasks); setEnabled(data.enabled); setError(""); }
  catch (error) { setError(error instanceof Error ? error.message : "Unable to load workflow."); }
  finally { setLoading(false); }
 }, []);
 useEffect(() => { const first = setTimeout(() => { void load(); }, 0); const timer = setInterval(load, 30000); return () => { clearTimeout(first); clearInterval(timer); }; }, [load]);
 async function update(input: Record<string, unknown>) {
  setBusy(true); setError("");
  try { const response = await fetch("/api/merchant/workflow", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); await load(); }
  catch (error) { setError(error instanceof Error ? error.message : "Unable to update workflow."); }
  finally { setBusy(false); }
 }
 return <div className="mx-auto max-w-7xl space-y-6"><h1 className="text-3xl font-bold">Workflow automation</h1><p className="max-w-3xl text-sm leading-7 text-slate-600">Automatically create follow-up tasks for unfinished merchant setup, products missing images or descriptions, and buyer inquiries awaiting your response. Tasks resolve when the underlying work is finished.</p><div className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-4"><label className="flex items-center gap-3 font-semibold"><input type="checkbox" checked={enabled} disabled={busy || loading} onChange={event => { void update({ enabled: event.target.checked }); }} />Enable automatic follow-up tasks</label><button disabled={busy} onClick={() => { void load(); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Refresh</button></div>{!enabled && <p className="text-sm">Automation is paused. Existing tasks remain available.</p>}{error && <p role="alert" className="text-red-700">{error}</p>}{loading ? <p role="status">Loading workflow...</p> : <div className="grid gap-5 lg:grid-cols-3">{columns.map(([status, label]) => <section key={status} className="space-y-3 rounded-2xl bg-slate-100 p-4"><h2 className="font-bold">{label} ({tasks.filter(task => task.status === status).length})</h2>{tasks.filter(task => task.status === status).map(task => <article key={task.id} className="space-y-3 rounded-xl bg-white p-4 shadow-sm"><h3 className="font-bold">{task.title}</h3><p className="text-sm text-slate-600">{task.detail}</p><Link href={task.href} className="block text-sm font-semibold text-blue-700">Open related work</Link><label className="block text-xs font-semibold">Task status<select value={task.status} disabled={busy} onChange={event => { void update({ id: task.id, status: event.target.value }); }} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm">{columns.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label></article>)}{!tasks.some(task => task.status === status) && <p className="text-sm text-slate-500">No tasks</p>}</section>)}</div>}</div>;
}
