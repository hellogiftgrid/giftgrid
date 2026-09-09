import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const admin = await requireAdmin();

  if (admin.role !== "super_admin") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-xl font-bold text-slate-950">
          Access restricted
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Only a super admin can view the platform activity log.
        </p>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: activities, error } =
    await supabase
      .from("activity_logs")
      .select(
        "id, actor_id, action, entity_type, entity_id, metadata, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Activity Log
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Track important platform and administrative events.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {(activities || []).length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No activity has been recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {(activities || []).map((item) => (
              <div
                key={item.id}
                className="p-5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-bold text-slate-900">
                      {item.action}
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      {item.entity_type || "system"}
                      {item.entity_id
                        ? ` · ${item.entity_id}`
                        : ""}
                    </div>
                  </div>

                  <time className="text-xs text-slate-400">
                    {new Intl.DateTimeFormat(
                      "en",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    ).format(
                      new Date(item.created_at)
                    )}
                  </time>
                </div>

                {item.metadata && (
                  <pre className="mt-3 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    {JSON.stringify(
                      item.metadata,
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
