"use client";
import { useCallback,useEffect,useState,type FormEvent } from "react";
import { DEVELOPER_SCOPES } from "@/lib/developer/scopes";
type App={id:string;name:string;description:string | null};
type Key={id:string;prefix:string;scopes:string[];expires_at:string;revoked_at:string | null};
type Webhook={id:string;url:string;events:string[]};
export default function DeveloperManager({mode}:{mode:"apps"|"keys"|"webhooks"}) {
  const [apps,setApps]=useState<App[]>([]),[selected,setSelected]=useState(""),[keys,setKeys]=useState<Key[]>([]),[webhooks,setWebhooks]=useState<Webhook[]>([]);
  const [notice,setNotice]=useState(""),[secret,setSecret]=useState(""),[busy,setBusy]=useState(false);
  async function request(url:string,init?:RequestInit) {
    const response=await fetch(url,init),data=await response.json();
    if(!response.ok)throw new Error(data.error || "Request failed.");
    return data;
  }
  const loadApps=useCallback(async()=>{
    try { const result=await request("/api/developer/apps");setApps(result.apps);setSelected(current=>current || result.apps[0]?.id || ""); }
    catch(error){setNotice(error instanceof Error ? error.message : "Unable to load apps.");}
  },[]);
  useEffect(()=>{const timer=setTimeout(()=>{void loadApps();},0);return()=>clearTimeout(timer);},[loadApps]);
  const loadDetails=useCallback(async()=>{
    if(!selected || mode==="apps")return;
    try {const result=await request(`/api/developer/apps/${selected}/${mode}`);if(mode==="keys")setKeys(result.keys);else setWebhooks(result.webhooks);}
    catch(error){setNotice(error instanceof Error ? error.message : "Unable to load details.");}
  },[selected,mode]);
  useEffect(()=>{const timer=setTimeout(()=>{void loadDetails();},0);return()=>clearTimeout(timer);},[loadDetails]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();const form=new FormData(event.currentTarget);setBusy(true);setNotice("");setSecret("");
    try {
      const payload=mode==="apps" ? {name:form.get("name"),description:form.get("description")} : mode==="keys" ? {scopes:form.getAll("scopes")} : {url:form.get("url"),events:String(form.get("events") || "").split(",").map(value=>value.trim()).filter(Boolean)};
      const result=await request(mode==="apps" ? "/api/developer/apps" : `/api/developer/apps/${selected}/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(mode==="keys")setSecret(result.key);
      setNotice(mode==="apps" ? "App registered." : mode==="keys" ? "Key created. Copy it now; it will not be shown again." : result.message);
      if(mode==="apps")await loadApps();else await loadDetails();
    }catch(error){setNotice(error instanceof Error ? error.message : "Please try again.");}
    finally{setBusy(false);}
  }
  async function revoke(id:string) {
    setBusy(true);setSecret("");
    try{await request(`/api/developer/keys/${id}`,{method:"DELETE"});setNotice("Key revoked.");await loadDetails();}
    catch(error){setNotice(error instanceof Error ? error.message : "Unable to revoke key.");}
    finally{setBusy(false);}
  }
  return <div className="mx-auto max-w-4xl space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-indigo-300">GiftGrid Console</p><h1 className="mt-3 text-3xl font-bold">{mode==="apps" ? "Apps / Projects" : mode==="keys" ? "API keys" : "Webhook registrations"}</h1><p className="mt-3 text-sm leading-6 text-slate-400">{mode==="apps" ? "Register your integrations and manage their credentials." : mode==="keys" ? "Keys are scoped, expire automatically, and can be revoked. Only their hashes are stored." : "Register HTTPS endpoints. Automated event delivery is not enabled in this release."}</p></div>
    {notice && <p role="status" className="rounded-xl border border-indigo-300/20 bg-indigo-400/10 p-4 text-sm text-indigo-100">{notice}</p>}
    {secret && <div className="rounded-xl border border-amber-300/30 p-4"><label className="text-sm font-semibold">New API key (shown once)<input value={secret} readOnly className="mt-2 w-full rounded-lg bg-slate-950 p-3 font-mono text-sm text-white" /></label><button onClick={()=>{void navigator.clipboard.writeText(secret).then(()=>setNotice("Key copied."));}} className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900">Copy key</button></div>}
    {mode!=="apps" && <label className="block text-sm font-semibold">App<select value={selected} onChange={event=>{setSelected(event.target.value);setSecret("");}} className="mt-2 w-full rounded-xl border border-white/20 bg-slate-900 p-3 text-white"><option value="">Select app</option>{apps.map(app=><option key={app.id} value={app.id}>{app.name}</option>)}</select></label>}
    {(mode==="apps" || selected) && <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[.04] p-6">
      {mode==="apps" ? <><label className="block text-sm">App name<input name="name" required maxLength={100} className="mt-2 w-full rounded-xl bg-slate-900 p-3" /></label><label className="block text-sm">Description (optional)<textarea name="description" maxLength={2000} className="mt-2 w-full rounded-xl bg-slate-900 p-3" /></label></> : mode==="keys" ? <fieldset><legend className="mb-3 text-sm font-semibold">Allowed scopes</legend><div className="grid gap-3 sm:grid-cols-2">{DEVELOPER_SCOPES.map(scope=><label key={scope} className="flex items-center gap-2 text-sm"><input name="scopes" type="checkbox" value={scope} defaultChecked={scope==="apps:read"} />{scope}</label>)}</div><p className="mt-4 text-xs text-slate-400">Keys created here expire after 90 days. The CLI supports a custom expiry within one year.</p></fieldset> : <><label className="block text-sm">HTTPS endpoint<input name="url" type="url" required className="mt-2 w-full rounded-xl bg-slate-900 p-3" /></label><label className="block text-sm">Event names (comma separated)<input name="events" required placeholder="listing.published, inquiry.created" className="mt-2 w-full rounded-xl bg-slate-900 p-3" /></label></>}
      <button disabled={busy} className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving..." : mode==="apps" ? "Register app" : mode==="keys" ? "Create API key" : "Register endpoint"}</button>
    </form>}
    {mode==="apps" && <div className="space-y-3">{apps.map(app=><article key={app.id} className="rounded-xl border border-white/10 p-5"><h2 className="font-bold">{app.name}</h2>{app.description && <p className="mt-2 text-sm text-slate-400">{app.description}</p>}<p className="mt-3 break-all font-mono text-xs text-slate-400">App ID: {app.id}</p></article>)}{!apps.length && <p className="text-sm text-slate-400">No apps registered yet.</p>}</div>}
    {mode==="keys" && keys.map(key=><article key={key.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 p-5"><div><p className="font-mono text-sm">{key.prefix}…</p><p className="mt-2 text-xs text-slate-400">{key.scopes.join(", ")} · Expires {new Date(key.expires_at).toLocaleDateString()}</p><p className="mt-1 text-xs text-slate-400">{key.revoked_at ? "Revoked" : "Active"}</p></div>{!key.revoked_at && <button onClick={()=>{void revoke(key.id);}} disabled={busy} className="rounded-lg border border-red-300/30 px-4 py-2 text-sm text-red-200">Revoke</button>}</article>)}
    {mode==="webhooks" && webhooks.map(hook=><article key={hook.id} className="rounded-xl border border-white/10 p-5"><p className="break-all text-sm">{hook.url}</p><p className="mt-2 text-xs text-slate-400">{hook.events.join(", ")}</p></article>)}
  </div>;
}
