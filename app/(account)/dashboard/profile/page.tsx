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
    <div className="space-y-8">{profile.role === "merchant" && <MerchantProfile />}<section className="mx-auto max-w-2xl"><h1 className="mb-2 text-2xl font-bold">Account and community profile</h1><p className="mb-5 text-sm text-slate-500">Manage your name, photo, introduction, country and visibility in Connect.</p><CommunityProfile /></section></div>
  </DashboardShell>;
}
