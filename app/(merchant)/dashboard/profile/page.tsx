"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FormState = {
  fullName: string;
  businessName: string;
  businessEmail: string;
  phone: string;
  country: string;
  storeUrl: string;
  businessCategory: string;
  productCategory: string;
  businessDescription: string;
};

export default function ProfilePage() {
  const supabase = createClient();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    businessName: "",
    businessEmail: "",
    phone: "",
    country: "",
    storeUrl: "",
    businessCategory: "",
    productCategory: "",
    businessDescription: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error("You are not signed in.");

        const [profileResult, merchantResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, email, phone, country")
            .eq("id", user.id)
            .limit(1),

          supabase
            .from("merchant_profiles")
            .select(`
              id,
              user_id,
              business_name,
              business_email,
              phone,
              country,
              store_url,
              business_category,
              product_category,
              business_description
            `)
            .eq("user_id", user.id)
            .limit(1),
        ]);

        if (profileResult.error) {
          throw new Error(
            `Profile could not be loaded: ${profileResult.error.message}`
          );
        }

        if (merchantResult.error) {
          throw new Error(
            `Merchant profile could not be loaded: ${merchantResult.error.message}`
          );
        }

        const profile = profileResult.data?.[0];
        const merchant = merchantResult.data?.[0];

        if (!profile) {
          throw new Error("Your account profile record could not be found.");
        }

        if (!merchant) {
          throw new Error("Your merchant workspace could not be found.");
        }

        setForm({
          fullName: profile.full_name || "",
          businessName: merchant.business_name || "",
          businessEmail:
            merchant.business_email || profile.email || user.email || "",
          phone: merchant.phone || profile.phone || "",
          country: merchant.country || profile.country || "",
          storeUrl: merchant.store_url || "",
          businessCategory: merchant.business_category || "",
          productCategory: merchant.product_category || "",
          businessDescription: merchant.business_description || "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase]);

  function setField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveProfile() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("You are not signed in.");

      const { error: merchantError } = await supabase
        .from("merchant_profiles")
        .update({
          business_name: form.businessName.trim(),
          business_email: form.businessEmail.trim(),
          phone: form.phone.trim() || null,
          country: form.country.trim() || null,
          store_url: form.storeUrl.trim() || null,
          business_category: form.businessCategory.trim() || null,
          product_category: form.productCategory.trim() || null,
          business_description: form.businessDescription.trim() || null,
        })
        .eq("user_id", user.id);

      if (merchantError) {
        throw new Error(
          `Business profile could not be saved: ${merchantError.message}`
        );
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: form.fullName.trim() || null,
          phone: form.phone.trim() || null,
          country: form.country.trim() || null,
        })
        .eq("id", user.id);

      if (profileError) {
        throw new Error(
          `Account profile could not be saved: ${profileError.message}`
        );
      }

      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-[#F7F9FC] -m-10 p-6 lg:p-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8">
          <p className="text-sm text-slate-500">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F7F9FC] -m-10 p-6 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-7">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-[#4F46E5]">
            Business profile
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Your GiftGrid profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage the business information GiftGrid uses for audits and
            opportunity matching.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Account details
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Full name
              </span>
              <input
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Account email
              </span>
              <input
                value={form.businessEmail}
                disabled
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Business information
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Business name
              </span>
              <input
                value={form.businessName}
                onChange={(e) => setField("businessName", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Business email
              </span>
              <input
                type="email"
                value={form.businessEmail}
                onChange={(e) => setField("businessEmail", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Phone
              </span>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Country
              </span>
              <input
                value={form.country}
                onChange={(e) => setField("country", e.target.value)}
                placeholder="Nigeria"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Store information
          </h2>

          <div className="mt-6 space-y-5">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Store URL
              </span>
              <input
                type="url"
                value={form.storeUrl}
                onChange={(e) => setField("storeUrl", e.target.value)}
                placeholder="https://yourstore.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Business category
                </span>
                <input
                  value={form.businessCategory}
                  onChange={(e) =>
                    setField("businessCategory", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Product category
                </span>
                <input
                  value={form.productCategory}
                  onChange={(e) =>
                    setField("productCategory", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
                />
              </label>
            </div>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Business description
              </span>
              <textarea
                rows={6}
                value={form.businessDescription}
                onChange={(e) =>
                  setField("businessDescription", e.target.value)
                }
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="min-w-[170px] rounded-xl bg-[#4F46E5] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4338CA] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
