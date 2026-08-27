import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Opportunities — GiftGrid Admin",
};

async function toggleOpportunity(formData: FormData) {
  "use server";

  const supabase = createClient();

  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  const publicDisplay =
    String(formData.get("public_display") || "") === "true";

  const { error } = await supabase
    .from("opportunities")
    .update({
      active,
      public_display: publicDisplay,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/opportunities");
  revalidatePath("/dashboard/opportunities");
}

export default async function AdminOpportunitiesPage() {
  const supabase = createClient();

  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select(
      "id, company_name, category, relationship_label, description, active, public_display, created_at"
    )
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
          Opportunity Network
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Opportunities
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Control which commercial opportunities are active and visible to merchants.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          Unable to load opportunities: {error.message}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {opportunities?.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-950">
                    {item.company_name}
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[#4F46E5]">
                    {item.category}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    item.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.active ? "Active" : "Inactive"}
                </span>
              </div>

              {item.relationship_label && (
                <div className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {item.relationship_label}
                </div>
              )}

              {item.description && (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <form action={toggleOpportunity}>
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={String(!item.active)}
                  />
                  <input
                    type="hidden"
                    name="public_display"
                    value={String(item.public_display)}
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    {item.active ? "Deactivate" : "Activate"}
                  </button>
                </form>

                <form action={toggleOpportunity}>
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={String(item.active)}
                  />
                  <input
                    type="hidden"
                    name="public_display"
                    value={String(!item.public_display)}
                  />
                  <button
                    type="submit"
                    className={`rounded-xl px-4 py-2 text-xs font-bold ${
                      item.public_display
                        ? "bg-[#4F46E5] text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.public_display
                      ? "Public"
                      : "Make Public"}
                  </button>
                </form>
              </div>
            </article>
          ))}

          {!opportunities?.length && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 md:col-span-2">
              No opportunities yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
