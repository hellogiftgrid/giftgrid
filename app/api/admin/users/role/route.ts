import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_ROLES = [
  "merchant",
  "corporate_buyer",
] as const;

type AllowedRole = (typeof ALLOWED_ROLES)[number];

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user: actor },
  } = await supabase.auth.getUser();

  if (!actor) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { data: actorProfile } =
    await supabase
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", actor.id)
      .single();

  if (
    !actorProfile ||
    actorProfile.role !== "super_admin" ||
    actorProfile.is_active === false
  ) {
    return NextResponse.json(
      { error: "Super admin access required." },
      { status: 403 }
    );
  }

  const body = await request.json();

  const userId = String(
    body?.userId || ""
  ).trim();

  const nextRole = String(
    body?.role || ""
  ).trim() as AllowedRole;

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  if (!ALLOWED_ROLES.includes(nextRole)) {
    return NextResponse.json(
      { error: "Invalid role." },
      { status: 400 }
    );
  }

  if (userId === actor.id) {
    return NextResponse.json(
      {
        error:
          "You cannot change your own role.",
      },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: target, error: targetError } =
    await admin
      .from("profiles")
      .select("id, email, role, full_name")
      .eq("id", userId)
      .single();

  if (targetError || !target) {
    return NextResponse.json(
      { error: "User not found." },
      { status: 404 }
    );
  }

  if (target.role === "super_admin") {
    return NextResponse.json(
      { error: "The sole super-admin account cannot be changed here." },
      { status: 400 }
    );
  }

  const { error: profileError } =
    await admin
      .from("profiles")
      .update({
        role: nextRole,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", userId);

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 }
    );
  }

  /*
   * Keep Auth metadata aligned with the
   * application profile.
   */
  const { error: authError } =
    await admin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          role: nextRole,
          full_name:
            target.full_name ?? undefined,
        },
      }
    );

  if (authError) {
    /*
     * Do not roll the database role backward here.
     * Record the mismatch for operators.
     */
    console.error(
      "Auth metadata role update failed:",
      authError
    );
  }

  await admin
    .from("activity_logs")
    .insert({
      actor_id: actor.id,
      action: "USER_ROLE_CHANGED",
      entity_type: "profile",
      entity_id: userId,
      metadata: {
        email: target.email,
        previous_role: target.role,
        new_role: nextRole,
      },
    });

  return NextResponse.json({
    success: true,
    userId,
    role: nextRole,
  });
}
