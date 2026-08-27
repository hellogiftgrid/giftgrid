import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Applications — GiftGrid Admin",
};

async function updateApplication(formData: FormData) {
  "use server";

  const supabase = createClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  const allowed = [
    "submitted",
    "under_review",
    "needs_info",
    "approved",
    "rejected",
  ];

  if (!allowed.includes(status)) {
    throw new Error("Invalid application status.");
  }

  const { error } = await supabase
    .from("merchant_applications")
    .update({
      status,
      reviewed_at: status === "approved" || status === "rejected"
        ? new Date().toISOString()
        : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}

export default async function AdminApplicationsPage() {
  const supabase = createClient();

  const { data: applications, error } = await supabase
    .from("merchant_applications")
    .select(
      "id, merchant_id, store_id, status, notes, submitted_at, reviewed_at, merchant:merchant_profiles(business_name, contact_email), store:stores(store_url, platform)"
    )
    .order("submitted_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
          Applications
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Merchant Applications
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Review and move merchant applications through the onboarding process.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          Unable to load applications: {error.message}
        </div>
      ) : (
        <div className="space-y-4">
          {applications?.map((item: any) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    {item.merchant?.business_name ?? "Unnamed merchant"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.merchant?.contact_email}
                  </p>

                  <p className="mt-3 text-sm text-slate-600">
                    {item.store?.store_url ?? "No store URL"}
                  </p>

                  <div className="mt-2 text-xs text-slate-400">
                    Platform: {item.store?.platform ?? "Not specified"} ·
                    Submitted{" "}
                    {new Date(item.submitted_at).toLocaleDateString()}
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                  {item.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "submitted",
                  "under_review",
                  "needs_info",
                  "approved",
                  "rejected",
                ].map((status) => (
                  <form action={updateApplication} key={status}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value={status} />
                    <button
                      type="submit"
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                        item.status === status
                          ? "bg-[#4F46E5] text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status.replaceAll("_", " ")}
                    </button>
                  </form>
                ))}
              </div>
            </article>
          ))}

          {!applications?.length && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No applications yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
