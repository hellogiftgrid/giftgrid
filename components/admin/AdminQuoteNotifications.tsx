"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Notice = { id: string; title: string; body: string | null; read: boolean; created_at: string };

export default function AdminQuoteNotifications() {
  const [items, setItems] = useState<Notice[]>([]);
  const [open, setOpen] = useState(false);
  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("notifications").select("id,title,body,read,created_at").eq("profile_id", user.id).order("created_at", { ascending: false }).limit(12);
    setItems(data || []);
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 20000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function markRead(item: Notice) {
    if (!item.read) {
      const supabase = createClient();
      await supabase.from("notifications").update({ read: true }).eq("id", item.id);
      setItems((current) => current.map((notice) => notice.id === item.id ? { ...notice, read: true } : notice));
    }
  }

  const unread = items.filter((item) => !item.read).length;
  return <div className="relative border-b border-slate-200 px-5 py-3">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-left text-sm font-bold text-indigo-800">
      <span>Quote alerts</span><span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">{unread}</span>
    </button>
    {open && <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">{items.map((item) => <Link key={item.id} href="/admin/marketplace" onClick={() => void markRead(item)} className={`block rounded-lg border p-3 text-xs ${item.read ? "border-slate-200 bg-white" : "border-indigo-200 bg-indigo-50"}`}><span className="font-bold text-slate-900">{item.title}</span><span className="mt-1 block text-slate-600">{item.body}</span><time className="mt-1 block text-slate-400">{new Date(item.created_at).toLocaleString()}</time></Link>)}{!items.length && <p className="px-3 py-2 text-xs text-slate-500">No quote alerts yet.</p>}</div>}
  </div>;
}
