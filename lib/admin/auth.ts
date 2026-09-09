import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminContext = {
  userId: string;
  email: string;
  role: string;
  fullName: string;
};

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();

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

  if (error || !profile || profile.role !== "super_admin") {
    redirect("/dashboard");
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    role: profile.role,
    fullName: profile.full_name ?? "GiftGrid Admin",
  };
}
