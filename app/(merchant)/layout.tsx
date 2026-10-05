import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role === "corporate_buyer"
    ? "corporate_buyer"
    :
    profile?.role === "super_admin"
      ? "super_admin"
      : profile?.role === "admin"
        ? "admin"
        : "merchant";

  return (
    <DashboardShell
      avatarUrl={role === "admin" || role === "super_admin" ? "/images/logo-full.png" : undefined}
      role={role}
      fullName={profile?.full_name || user.email || "GiftGrid User"}
      email={user.email || ""}
    >
      {children}
    </DashboardShell>
  );
}
