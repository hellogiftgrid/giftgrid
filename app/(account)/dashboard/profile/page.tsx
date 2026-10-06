import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MerchantProfile from "@/components/merchant/MerchantProfile";
import CommunityProfile from "@/components/community/CommunityProfile";
import DashboardShell, { type DashboardRole } from "@/components/dashboard/DashboardShell";
import { GIFTGRID_ADMIN_AVATAR, isGiftGridAdmin } from "@/config/identity";
export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/dashboard/profile");
  const { data: profile, error } = await supabase.from("profiles").select("role,full_name,is_active").eq("id", user.id).single();
  if (error || !profile) throw new Error("Unable to load your account profile.");
  if (profile.is_active === false) redirect("/auth/sign-in");
  return <DashboardShell role={profile.role as DashboardRole} fullName={profile.full_name || "GiftGrid member"} email={user.email || ""} avatarUrl={isGiftGridAdmin(profile.role) ? GIFTGRID_ADMIN_AVATAR : undefined}>
    <section className="mx-auto max-w-3xl space-y-6"><h1 className="text-2xl font-bold">Your GiftGrid profile</h1><CommunityProfile />{profile.role === "merchant" && <MerchantProfile />}</section>
  </DashboardShell>;
}
