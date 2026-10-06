"use client";
import { useEffect, useState } from "react";

type Profile = { id: string; company_name: string; website: string | null; job_title: string | null; company_size: string | null; status: string; is_primary: boolean; created_at: string };

export default function BuyerProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = () => { fetch("/api/buyer/profiles").then((r) => r.json()).then((d) => setProfiles(d.profiles || [])).catch(() => {}); };
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/buyer/profiles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ company_name: company, website: website || undefined, is_primary: profiles.length === 0 }) });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error || "Unable to create profile.");
    setMessage("Profile created — pending review.");
    setCompany(""); setWebsite("");
    load();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">Your buyer profiles</h2>
      <p className="text-xs text-slate-500">One account can hold multiple buyer profiles for different teams or companies.</p>
      <ul className="mt-4 divide-y divide-slate-100">
        {profiles.map((p) => (
          <li key={p.id} className="flex items-center justify-between py-3 text-sm">
            <span className="font-semibold text-slate-800">{p.company_name} {p.is_primary && <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Primary</span>}</span>
            <span className="text-slate-500">{p.status}</span>
          </li>
        ))}
        {!profiles.length && <li className="py-3 text-sm text-slate-500">No buyer profiles yet.</li>}
      </ul>
      <form onSubmit={create} className="mt-4 flex flex-wrap gap-2">
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website (optional)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Add profile</button>
      </form>
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </section>
  );
}
