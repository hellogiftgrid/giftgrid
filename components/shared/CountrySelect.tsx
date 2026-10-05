"use client";
import { useRef, useState } from "react";
import countries from "@/config/countries.json";
export default function CountrySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [search, setSearch] = useState("");
  const details = useRef<HTMLDetailsElement>(null);
  const selected = countries.find(country => country.name === value || country.code === value);
  const visible = countries.filter(country => (country.name + " " + country.code).toLowerCase().includes(search.trim().toLowerCase()));
  return <details ref={details} className="relative mt-2 font-normal">
    <summary aria-label="Country" className="flex cursor-pointer list-none items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm">
      {selected && <img src={"/flags/" + selected.code + ".svg"} alt="" className="h-5 w-7 object-cover" />}<span>{selected?.name || value || "Select country"}</span><span aria-hidden="true" className="ml-auto">?</span>
    </summary>
    <div className="absolute left-0 right-0 z-30 mt-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl" onKeyDown={event => { if (event.key === "Escape" && details.current) details.current.open = false; }}>
      <input aria-label="Search countries" autoComplete="off" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search all countries" className="mb-2 w-full rounded-lg border border-slate-300 p-3 text-sm" />
      <ul aria-label="Countries" className="max-h-64 overflow-y-auto">{visible.map(country => <li key={country.code}><button type="button" aria-pressed={selected?.code === country.code} onClick={() => { onChange(country.name); setSearch(""); if (details.current) details.current.open = false; }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-blue-50 focus:bg-blue-50"><img src={"/flags/" + country.code + ".svg"} alt="" loading="lazy" className="h-5 w-7 object-cover" />{country.name}</button></li>)}</ul>{!visible.length && <p className="p-3 text-sm">No countries match your search.</p>}
    </div>
  </details>;
}
