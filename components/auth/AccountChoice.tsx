"use client";
export type AccountType = "buyer" | "merchant";
const choices = [
  { value: "buyer" as const, title: "I'm a buyer", detail: "Find gifts, source products, and connect with brands.", label: "Source something special", path: "M3 8h18v13H3zM1 4h22v4H1zM12 4v17M12 4H7a2 2 0 1 1 2-2l3 2Zm0 0h5a2 2 0 1 0-2-2l-3 2Z" },
  { value: "merchant" as const, title: "I'm a merchant", detail: "Showcase your products and meet gifting buyers.", label: "Grow your business", path: "M3 10v11h18V10M2 10l2-7h16l2 7M2 10c0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0M9 21v-7h6v7" },
];
export default function AccountChoice({ value, onChange }: { value: AccountType | null; onChange: (value: AccountType) => void }) {
  return <fieldset><legend className="mb-4 text-sm font-semibold text-slate-700">Choose how you&apos;d like to use GiftGrid</legend><div className="grid gap-3 sm:grid-cols-2">{choices.map(choice => <label key={choice.value} className={`relative cursor-pointer rounded-2xl border-2 p-5 transition focus-within:ring-4 focus-within:ring-blue-100 ${value === choice.value ? "border-blue-600 bg-blue-50/60" : "border-slate-200 bg-white hover:border-blue-300"}`}>
    <input type="radio" name="accountType" value={choice.value} checked={value === choice.value} onChange={() => onChange(choice.value)} className="sr-only" />
    <span aria-hidden="true" className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${value === choice.value ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>{value === choice.value && <span className="h-2 w-2 rounded-full bg-white" />}</span>
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-5 h-8 w-8 text-blue-700"><path d={choice.path} /></svg>
    <span className="block text-lg font-bold text-slate-950">{choice.title}</span><span className="mt-2 block text-sm leading-6 text-slate-600">{choice.detail}</span><span className="mt-5 block text-xs font-semibold text-blue-700">{choice.label}</span>
  </label>)}</div></fieldset>;
}
