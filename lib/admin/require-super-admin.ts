import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireSuperAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, is_active"
    )
    .eq("id", user.id)
    .single();

  if (
    error ||
    !profile ||
    profile.role !== "super_admin" ||
    profile.is_active === false
  ) {
    redirect("/dashboard");
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName: profile.full_name ?? "GiftGrid Super Admin",
    role: profile.role,
  };
}
