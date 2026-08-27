import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminContext = {
  userId: string;
  email: string;
  role: string;
  fullName: string;
};

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  if (
    error ||
    !profile ||
    !["admin", "super_admin"].includes(profile.role)
  ) {
    redirect("/dashboard");
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    role: profile.role,
    fullName: profile.full_name ?? "GiftGrid Admin",
  };
}
