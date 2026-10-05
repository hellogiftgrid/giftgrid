import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfilePage from "@/components/merchant/MerchantProfile";

export default async function MerchantSetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "merchant") redirect("/dashboard");
  return <main className="min-h-screen overflow-x-hidden bg-slate-50 p-6 sm:p-10"><ProfilePage /></main>;
}
