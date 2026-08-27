import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Merchants — GiftGrid Admin",
};

export default async function AdminMerchantsPage() {
  const supabase = createClient();

  const { data: merchants, error } = await supabase
    .from("merchant_profiles")
    .select(
      "id, business_name, contact_email, phone, created_at, profile:profiles(full_name, role)"
    )
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
          Merchants
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Merchant Directory
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Every merchant account in the GiftGrid platform.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          Unable to load merchants: {error.message}
        </div>
      ) : !merchants?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No merchants yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 font-bold text-slate-600">
                    Business
                  </th>
                  <th className="px-5 py-4 font-bold text-slate-600">
                    Contact
                  </th>
                  <th className="px-5 py-4 font-bold text-slate-600">
                    Role
                  </th>
                  <th className="px-5 py-4 font-bold text-slate-600">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {merchants.map((merchant: any) => (
                  <tr
                    key={merchant.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-950">
                        {merchant.business_name}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {merchant.profile?.full_name ?? "No name"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {merchant.contact_email}
                      {merchant.phone && (
                        <div className="mt-1 text-xs text-slate-400">
                          {merchant.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold capitalize text-[#4F46E5]">
                        {merchant.profile?.role ?? "merchant"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {new Date(merchant.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
