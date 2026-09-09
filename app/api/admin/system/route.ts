import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireSuperAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    user,
    profile,
  };
}

export async function GET() {
  const { user, profile } =
    await requireSuperAdmin();

  if (!user || profile?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const admin = createAdminClient();

  const [
    users,
    bookingAdmins,
    bookings,
    activity,
  ] = await Promise.all([
    admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),

    admin
      .from("booking_admins")
      .select(
        "id, profile_id, slug, display_name, active, accepting_bookings, google_calendar_email, calendly_user_uri, calendly_scheduling_url"
      )
      .order("created_at", {
        ascending: true,
      }),

    admin
      .from("bookings")
      .select(
        "id, guest_name, guest_email, start_at, end_at, status, meeting_type, meeting_url, calendly_status"
      )
      .order("start_at", {
        ascending: false,
      })
      .limit(20),

    admin
      .from("activity_logs")
      .select(
        "id, actor_id, action, entity_type, entity_id, metadata, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(25),
  ]);

  return NextResponse.json({
    success: true,
    current_admin: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
    },
    auth_users: users.data?.users || [],
    auth_error: users.error?.message || null,
    booking_admins: bookingAdmins.data || [],
    booking_admin_error:
      bookingAdmins.error?.message || null,
    recent_bookings: bookings.data || [],
    booking_error:
      bookings.error?.message || null,
    recent_activity: activity.data || [],
    activity_error:
      activity.error?.message || null,
  });
}

export async function POST(
  request: Request
) {
  const { user, profile } =
    await requireSuperAdmin();

  if (!user || profile?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await request.json();

  const action =
    String(body.action || "");

  const admin = createAdminClient();

  try {
    if (action === "create_user") {
      const email =
        String(body.email || "").trim();

      const password =
        String(body.password || "");

      const fullName =
        String(body.fullName || "").trim();

      const role =
        ["merchant", "admin", "super_admin"].includes(
          String(body.role)
        )
          ? String(body.role)
          : "merchant";

      if (!email || password.length < 8) {
        return NextResponse.json(
          {
            error:
              "Email and an 8+ character password are required.",
          },
          { status: 400 }
        );
      }

      const { data, error } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            role,
          },
        });

      if (error) {
        throw error;
      }

      if (data.user) {
        await admin
          .from("profiles")
          .upsert({
            id: data.user.id,
            email,
            full_name: fullName || null,
            role,
            is_active: true,
            updated_at: new Date().toISOString(),
          });

        await admin
          .from("activity_logs")
          .insert({
            actor_id: user.id,
            action: "AUTH_USER_CREATED",
            entity_type: "profile",
            entity_id: data.user.id,
            metadata: {
              email,
              role,
            },
          });
      }

      return NextResponse.json({
        success: true,
        user: data.user,
      });
    }

    if (action === "update_user") {
      const userId =
        String(body.userId || "");

      const email =
        body.email !== undefined
          ? String(body.email).trim()
          : undefined;

      const password =
        body.password !== undefined
          ? String(body.password)
          : undefined;

      const fullName =
        body.fullName !== undefined
          ? String(body.fullName).trim()
          : undefined;

      const update: Record<string, unknown> =
        {};

      if (email) update.email = email;
      if (password) {
        if (password.length < 8) {
          return NextResponse.json(
            {
              error:
                "Password must be at least 8 characters.",
            },
            { status: 400 }
          );
        }

        update.password = password;
      }

      if (fullName !== undefined) {
        update.user_metadata = {
          full_name: fullName,
        };
      }

      const { data, error } =
        await admin.auth.admin.updateUserById(
          userId,
          update
        );

      if (error) {
        throw error;
      }

      if (fullName !== undefined) {
        await admin
          .from("profiles")
          .update({
            full_name: fullName,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", userId);
      }

      await admin
        .from("activity_logs")
        .insert({
          actor_id: user.id,
          action: "AUTH_USER_UPDATED",
          entity_type: "profile",
          entity_id: userId,
          metadata: {
            email: email || null,
            password_changed:
              Boolean(password),
          },
        });

      return NextResponse.json({
        success: true,
        user: data.user,
      });
    }

    if (action === "confirm_user") {
      const userId =
        String(body.userId || "");

      const { data, error } =
        await admin.auth.admin.updateUserById(
          userId,
          {
            email_confirm: true,
          }
        );

      if (error) {
        throw error;
      }

      await admin
        .from("activity_logs")
        .insert({
          actor_id: user.id,
          action: "AUTH_USER_CONFIRMED",
          entity_type: "profile",
          entity_id: userId,
        });

      return NextResponse.json({
        success: true,
        user: data.user,
      });
    }

    if (action === "disable_user") {
      const userId =
        String(body.userId || "");

      if (userId === user.id) {
        return NextResponse.json(
          {
            error:
              "You cannot disable your own account.",
          },
          { status: 400 }
        );
      }

      const { data, error } =
        await admin.auth.admin.updateUserById(
          userId,
          {
            ban_duration: "876000h",
          }
        );

      if (error) {
        throw error;
      }

      await admin
        .from("profiles")
        .update({
          is_active: false,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", userId);

      await admin
        .from("activity_logs")
        .insert({
          actor_id: user.id,
          action: "AUTH_USER_DISABLED",
          entity_type: "profile",
          entity_id: userId,
        });

      return NextResponse.json({
        success: true,
        user: data.user,
      });
    }

    if (action === "enable_user") {
      const userId =
        String(body.userId || "");

      const { data, error } =
        await admin.auth.admin.updateUserById(
          userId,
          {
            ban_duration: "none",
          }
        );

      if (error) {
        throw error;
      }

      await admin
        .from("profiles")
        .update({
          is_active: true,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", userId);

      await admin
        .from("activity_logs")
        .insert({
          actor_id: user.id,
          action: "AUTH_USER_ENABLED",
          entity_type: "profile",
          entity_id: userId,
        });

      return NextResponse.json({
        success: true,
        user: data.user,
      });
    }

    if (action === "delete_user") {
      const userId =
        String(body.userId || "");

      if (userId === user.id) {
        return NextResponse.json(
          {
            error:
              "You cannot delete your own account.",
          },
          { status: 400 }
        );
      }

      const { error } =
        await admin.auth.admin.deleteUser(
          userId,
          false
        );

      if (error) {
        throw error;
      }

      await admin
        .from("activity_logs")
        .insert({
          actor_id: user.id,
          action: "AUTH_USER_DELETED",
          entity_type: "profile",
          entity_id: userId,
        });

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      {
        error:
          "Unknown system action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Super-admin system operation failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Operation failed.",
      },
      { status: 500 }
    );
  }
}
