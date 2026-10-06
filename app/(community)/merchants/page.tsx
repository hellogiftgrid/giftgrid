import { permanentRedirect } from "next/navigation";
import MemberDirectory from "@/components/community/MemberDirectory";
import MerchantRanking from "@/components/merchant/MerchantRanking";
export default function MerchantsPage(){return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">GiftGrid merchants</p><h1 className="mt-2 text-3xl font-bold">Browse listed merchants</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Browse merchant profiles and current published products. Trade decks appear on each profile when the merchant has supplied an approved PDF.</p></div><MerchantRanking/>
<MemberDirectory merchantsOnly/></main>;}
