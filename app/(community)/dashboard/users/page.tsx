import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/admin/require-super-admin";
import UserRoleControls from "@/components/admin/UserRoleControls";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireSuperAdmin();

  const supabase = await createClient();

  const {
    data: users,
    error,
  } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, is_active, created_at"
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const counts = {
    total:
      users?.length || 0,
    merchants:
      users?.filter(
        (user) =>
          user.role === "merchant"
      ).length || 0,
    admins:
      users?.filter(
        (user) =>
          user.role === "admin"
      ).length || 0,
    superAdmins:
      users?.filter(
        (user) =>
          user.role === "super_admin"
      ).length || 0,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      <section>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          Super Admin
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Users & Access
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
          Manage GiftGrid application roles directly from the
          dashboard.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total" value={counts.total} />
        <Stat label="Merchants" value={counts.merchants} />
        <Stat label="Admins" value={counts.admins} />
        <Stat label="Super Admins" value={counts.superAdmins} />
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-950">
            Platform users
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Changes are written to the audit log.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {(users || []).map((user) => (
            <div
              key={user.id}
              className="grid gap-5 p-6 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="font-bold text-slate-950">
                  {user.full_name ||
                    "Unnamed user"}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {user.email}
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold capitalize text-slate-600">
                    {(user.role || "merchant").replaceAll(
                      "_",
                      " "
                    )}
                  </span>

                  <span
                    className={
                      user.is_active === false
                        ? "rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700"
                        : "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
                    }
                  >
                    {user.is_active === false
                      ? "Inactive"
                      : "Active"}
                  </span>
                </div>
              </div>

              <UserRoleControls
                userId={user.id}
                currentRole={
                  user.role || "merchant"
                }
              />
            </div>
          ))}

          {!users?.length && (
            <div className="p-12 text-center text-sm text-slate-400">
              No users found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>

      <div className="mt-3 text-3xl font-bold text-slate-950">
        {value}
      </div>
    </div>
  );
}
