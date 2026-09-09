export const dynamic = "force-dynamic";
export const metadata = { title: "Keys — GiftGrid Console" };

export default function ConsoleKeysPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-300">GiftGrid Console</p>
        <h1 className="mt-3 text-3xl font-bold">Keys</h1>
        <p className="mt-2 text-slate-400">This section is under active development.</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[.04] p-8 text-center text-slate-400">
        Coming soon — check the <a href="/console/docs" className="text-indigo-300 underline">API docs</a> for current capabilities.
      </div>
    </div>
  );
}
