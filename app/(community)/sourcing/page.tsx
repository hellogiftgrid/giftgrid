import BuyerRequestBoard from "@/components/public/BuyerRequestBoard";
export const dynamic="force-dynamic";
export const metadata={title:"Open Requests | GiftGrid",description:"Browse and post private gifting and sourcing requests on GiftGrid."};
export default function SourcingPage(){return <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-700">GiftGrid marketplace</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Open sourcing requests</h1><p className="mt-2 mb-6 text-sm leading-6 text-slate-600">Buyer requests live here, separate from community discussions. Signed-in merchants can read full briefs; qualified merchants can respond.</p><BuyerRequestBoard/></main>}
