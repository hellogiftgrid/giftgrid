import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Audits — GiftGrid Admin",
};

async function updateAuditStatus(formData: FormData) {
  "use server";

  const supabase = createClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  const allowed = ["draft", "approved", "archived"];

  if (!allowed.includes(status)) {
    throw new Error("Invalid audit status.");
  }

  const { error } = await supabase
    .from("audits")
    .update({
      status,
      approved_at:
        status === "approved"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/audits");
  revalidatePath("/admin");
  revalidatePath("/dashboard/audit");
}

export default async function AdminAuditsPage() {
  const supabase = createClient();

  const { data: audits, error } = await supabase
    .from("audits")
    .select(
      "id, store_id, status, executive_summary, overall_score, approved_at, created_at"
    )
    .order("created_at", { ascending: false });

  const storeIds = [...new Set((audits ?? []).map((a) => a.store_id))];

  const { data: stores } = storeIds.length
    ? await supabase
        .from("stores")
        .select("id, store_url, merchant_id")
        .in("id", storeIds)
    : { data: [] as any[] };

  const merchantIds = [...new Set((stores ?? []).map((s) => s.merchant_id))];

  const { data: merchants } = merchantIds.length
    ? await supabase
        .from("merchant_profiles")
        .select("id, business_name, contact_email")
        .in("id", merchantIds)
    : { data: [] as any[] };

  const storeMap = new Map((stores ?? []).map((s) => [s.id, s]));
  const merchantMap = new Map((merchants ?? []).map((m) => [m.id, m]));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
          Audits
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Store Audit Queue
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review, approve and archive official GiftGrid store audits.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          Unable to load audits: {error.message}
        </div>
      ) : (
        <div className="space-y-4">
          {audits?.map((audit) => {
            const store = storeMap.get(audit.store_id);
            const merchant = store
              ? merchantMap.get(store.merchant_id)
              : null;

            return (
              <article
                key={audit.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      {merchant?.business_name ?? "Unknown merchant"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {store?.store_url ?? "Unknown store"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>
                        Created{" "}
                        {new Date(audit.created_at).toLocaleDateString()}
                      </span>

                      {audit.overall_score !== null && (
                        <span>Score {audit.overall_score}/100</span>
                      )}
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                    {audit.status.replaceAll("_", " ")}
                  </span>
                </div>

                {audit.executive_summary && (
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
                    {audit.executive_summary}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/audit`}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Merchant Audit View
                  </Link>

                  {["draft", "approved", "archived"].map((status) => (
                    <form action={updateAuditStatus} key={status}>
                      <input type="hidden" name="id" value={audit.id} />
                      <input type="hidden" name="status" value={status} />

                      <button
                        type="submit"
                        className={`rounded-xl px-4 py-2 text-xs font-bold ${
                          audit.status === status
                            ? "bg-[#4F46E5] text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </button>
                    </form>
                  ))}
                </div>
              </article>
            );
          })}

          {!audits?.length && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No audits yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
