import Link from "next/link";
import BuyerRequestBoard from "@/components/public/BuyerRequestBoard";
export const dynamic="force-dynamic";
export const metadata={title:"Sourcing Request | GiftGrid"};
export default async function SourcingRequestPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6"><Link href="/sourcing" className="text-sm font-semibold text-indigo-700 underline">← All open requests</Link><BuyerRequestBoard requestId={id}/></main>}
