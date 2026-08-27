import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Support — GiftGrid Admin",
};

async function updateTicket(formData: FormData) {
  "use server";

  const supabase = createClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  const allowed = ["open", "in_progress", "closed"];

  if (!allowed.includes(status)) {
    throw new Error("Invalid ticket status.");
  }

  const { error } = await supabase
    .from("support_tickets")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/support");
  revalidatePath("/dashboard/comms");
}

export default async function AdminSupportPage() {
  const supabase = createClient();

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select(
      "id, merchant_id, subject, status, created_at, merchant:merchant_profiles(business_name, contact_email)"
    )
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
          Support
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Support & Expert Requests
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage requests coming from merchants, including expert help.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          Unable to load support tickets: {error.message}
        </div>
      ) : (
        <div className="space-y-4">
          {tickets?.map((ticket: any) => (
            <article
              key={ticket.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="font-bold text-slate-950">
                    {ticket.subject}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {ticket.merchant?.business_name ?? "Unknown merchant"} ·{" "}
                    {ticket.merchant?.contact_email ?? ""}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-700">
                  {ticket.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {["open", "in_progress", "closed"].map((status) => (
                  <form action={updateTicket} key={status}>
                    <input type="hidden" name="id" value={ticket.id} />
                    <input type="hidden" name="status" value={status} />

                    <button
                      type="submit"
                      className={`rounded-xl px-4 py-2 text-xs font-bold ${
                        ticket.status === status
                          ? "bg-[#4F46E5] text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status.replaceAll("_", " ")}
                    </button>
                  </form>
                ))}
              </div>
            </article>
          ))}

          {!tickets?.length && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No support tickets yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
