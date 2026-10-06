"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CountrySelect from "@/components/shared/CountrySelect";

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
  avatarUrl: string;
};

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    businessName: "",
    businessEmail: "",
    phone: "",
    country: "United States",
    storeUrl: "",
    businessCategory: "",
    productCategory: "",
    businessDescription: "",
    avatarUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [decks, setDecks] = useState<{ id: string; title: string; file_type: string; review_status: string; created_at: string }[]>([]);
  const [deckUploading, setDeckUploading] = useState(false);

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
            .select("full_name")
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
              ,avatar_url
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
            merchant.business_email || user.email || "",
          phone: merchant.phone || "",
          country: merchant.country || "",
          storeUrl: merchant.store_url || "",
          businessCategory: merchant.business_category || "",
          productCategory: merchant.product_category || "",
          businessDescription: merchant.business_description || "",
          avatarUrl: merchant.avatar_url || "",
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

  async function uploadAvatar(file?: File) {
    if (!file) return;
    setUploading(true); setError("");
    const payload = new FormData(); payload.set("file", file);
    const response = await fetch("/api/merchant/profile-image", { method: "POST", body: payload });
    const result = await response.json();
    if (!response.ok) setError(result.error || "Image upload failed.");
    else setField("avatarUrl", result.url);
    setUploading(false);
  }

  async function loadDecks() {
    try {
      const response = await fetch("/api/merchant/trade-deck", { cache: "no-store" });
      const result = await response.json();
      if (response.ok) setDecks(result.documents || []);
    } catch { /* ignore */ }
  }

  useEffect(() => { void loadDecks(); }, []);

  async function uploadTradeDeck(file?: File) {
    if (!file) return;
    setDeckUploading(true); setError("");
    const payload = new FormData(); payload.set("file", file);
    const response = await fetch("/api/merchant/trade-deck", { method: "POST", body: payload });
    const result = await response.json();
    if (!response.ok) setError(result.error || "Trade deck upload failed.");
    else { setMessage("Trade deck uploaded. It will be reviewed before it appears on your profile."); await loadDecks(); }
    setDeckUploading(false);
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

      if (!form.fullName.trim() || !form.businessName.trim() || !form.businessEmail.trim() || !form.businessCategory.trim() || !form.country.trim()) {
        throw new Error("Enter your name, business name, business email, category, and country.");
      }

      const response = await fetch("/api/merchant/onboarding", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save your profile.");

      setMessage("Profile saved successfully.");
      router.push("/dashboard");
      router.refresh();
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
      <div className="min-h-full bg-[#F7F9FC] p-4 lg:p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8">
          <p className="text-sm text-slate-500">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F7F9FC] p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-7">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-[#4F46E5]">
            Business profile
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Your GiftGrid profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage the business information GiftGrid uses for your profile and
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
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Profile image</span>
              <div className="flex items-center gap-4"><div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">{form.avatarUrl ? <img src={form.avatarUrl} alt="Profile preview" className="h-full w-full object-cover" /> : form.businessName.slice(0, 1).toUpperCase() || "M"}</div><label className="cursor-pointer rounded-xl border border-dashed border-indigo-300 px-4 py-3 text-sm font-semibold text-indigo-700">{uploading ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} className="sr-only" onChange={(e) => { uploadAvatar(e.target.files?.[0]); e.currentTarget.value = ""; }} /></label></div>
              <span className="mt-1 block text-xs text-slate-400">JPG, PNG, or WebP up to 2 MB. Shown to approved buyers.</span>
            </label>
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
                Business name (required)
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
                Phone (optional)
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
              <CountrySelect value={form.country} onChange={value => setField("country", value)} />
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
                Store URL (optional)
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
                  Business category (required)
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Trade deck (optional)</h2>
          <p className="mt-1 text-sm text-slate-500">Share a PDF or document that introduces your products and capabilities. You can skip this — it is not required and will not affect your account or listings.</p>
          <div className="mt-4">
            <label className="cursor-pointer rounded-xl border border-dashed border-indigo-300 px-4 py-3 text-sm font-semibold text-indigo-700 inline-block">
              {deckUploading ? "Uploading…" : "Upload trade deck"}
              <input type="file" accept="application/pdf,image/jpeg,image/png,.pptx,.ppt,.docx,.doc" disabled={deckUploading} className="sr-only" onChange={(e) => { uploadTradeDeck(e.target.files?.[0]); e.currentTarget.value = ""; }} />
            </label>
            <span className="ml-3 text-xs text-slate-400">PDF, image, or Office document, up to 10 MB.</span>
          </div>
          {decks.length > 0 && (
            <ul className="mt-4 space-y-2">
              {decks.map((deck) => (
                <li key={deck.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2 text-sm">
                  <span className="font-semibold text-slate-700">{deck.title}</span>
                  <span className="text-xs text-slate-400">{deck.review_status.replace("_", " ")} · {new Date(deck.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
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
