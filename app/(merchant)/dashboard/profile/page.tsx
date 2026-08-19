"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MerchantProfile = {
  id: string;
  user_id: string;
  business_name: string | null;
  business_email: string | null;
  phone: string | null;
  country: string | null;
  store_url: string | null;
  business_category: string | null;
  product_category: string | null;
  business_description: string | null;
};

type Profile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
};

export default function ProfilePage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);

  const [form, setForm] = useState({
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(userError?.message || "You are not signed in.");
        setLoading(false);
        return;
      }

      const [profileRes, merchantRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, email, phone, country")
          .eq("id", user.id)
          .single(),

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
          .single(),
      ]);

      if (profileRes.error) {
        setError(`Profile could not be loaded: ${profileRes.error.message}`);
        setLoading(false);
        return;
      }

      if (merchantRes.error) {
        setError(
          `Merchant profile could not be loaded: ${merchantRes.error.message}`
        );
        setLoading(false);
        return;
      }

      const nextProfile = profileRes.data as Profile;
      const nextMerchant = merchantRes.data as MerchantProfile;

      setProfile(nextProfile);
      setMerchant(nextMerchant);

      setForm({
        fullName: nextProfile.full_name || "",
        businessName: nextMerchant.business_name || "",
        businessEmail:
          nextMerchant.business_email || nextProfile.email || user.email || "",
        phone: nextMerchant.phone || nextProfile.phone || "",
        country: nextMerchant.country || nextProfile.country || "",
        storeUrl: nextMerchant.store_url || "",
        businessCategory: nextMerchant.business_category || "",
        productCategory: nextMerchant.product_category || "",
        businessDescription: nextMerchant.business_description || "",
      });

      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message || "You are not signed in.");
      }

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
        err instanceof Error
          ? err.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-[#F7F9FC] -m-10 p-6 lg:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="h-10 w-2/3 rounded bg-slate-200" />
              <div className="h-32 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !merchant) {
    return (
      <div className="min-h-full bg-[#F7F9FC] -m-10 p-6 lg:p-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Profile unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "Your merchant workspace could not be loaded."}
          </p>
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
            Keep your business information current so GiftGrid can evaluate
            your store and match you with opportunities.
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
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Full name
              </span>
              <input
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Account email
              </span>
              <input
                value={profile.email || ""}
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
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Business name
              </span>
              <input
                required
                value={form.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Business email
              </span>
              <input
                type="email"
                required
                value={form.businessEmail}
                onChange={(e) => updateField("businessEmail", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Phone
              </span>
              <input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Country
              </span>
              <input
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
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
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Store URL
              </span>
              <input
                type="url"
                value={form.storeUrl}
                onChange={(e) => updateField("storeUrl", e.target.value)}
                placeholder="https://yourstore.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Business category
                </span>
                <input
                  value={form.businessCategory}
                  onChange={(e) =>
                    updateField("businessCategory", e.target.value)
                  }
                  placeholder="Fashion, Gifts, Beauty..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Product category
                </span>
                <input
                  value={form.productCategory}
                  onChange={(e) =>
                    updateField("productCategory", e.target.value)
                  }
                  placeholder="Gift boxes, apparel, homeware..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Business description
              </span>
              <textarea
                rows={6}
                value={form.businessDescription}
                onChange={(e) =>
                  updateField("businessDescription", e.target.value)
                }
                placeholder="Tell us about your business and products."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving…
              </>
            ) : (
              "Save profile"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
