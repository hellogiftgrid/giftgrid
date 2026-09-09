/**
 * /app/console/layout.tsx
 *
 * Wraps all /console/* pages.
 * Redirects non-developer/non-super_admin users.
 * Uses DashboardShell with role="developer".
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  const allowed =
    profile?.role === "developer" || profile?.role === "super_admin";

  if (!allowed) redirect("/dashboard");

  return (
    <DashboardShell
      role={profile.role === "super_admin" ? "super_admin" : "developer"}
      fullName={profile?.full_name || user.email || "Developer"}
      email={profile?.email || user.email || ""}
    >
      {children}
    </DashboardShell>
  );
}
