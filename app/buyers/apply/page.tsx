"use client";

import PageSections from "@/components/public/PageSections";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { opportunityCategories } from "@/config/branding";

export default function BuyerApplyPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const categories = form.getAll("categories").map(String);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: "corporate_buyer",
          full_name: String(form.get("fullName") || "").trim(),
          company_name: String(form.get("companyName") || "").trim(),
          website: String(form.get("website") || "").trim(),
          job_title: String(form.get("jobTitle") || "").trim(),
          company_size: String(form.get("companySize") || ""),
          annual_gifting_budget: String(form.get("budget") || ""),
          buying_categories: categories,
          use_case: String(form.get("useCase") || ""),
          estimated_recipients: String(form.get("recipients") || ""),
          desired_timeline: String(form.get("timeline") || ""),
          requirements: String(form.get("requirements") || "").trim(),
        },
      },
    });

    setLoading(false);
    if (signUpError) return setError(signUpError.message);
    if (data.session) {
      router.push("/buyer/dashboard");
      router.refresh();
      return;
    }
    router.push("/auth/verify?email=" + encodeURIComponent(email) + "&next=/buyer/dashboard");
  }

  return (
    <main className="site-themed min-h-screen bg-[#f4f6fa] px-5 py-6 sm:py-10">
      <div className="mx-auto max-w-[1280px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">← GiftGrid home</Link>
        <div className="mt-6 grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_100px_-50px_rgba(15,23,42,.35)] lg:grid-cols-[.78fr_1.22fr]">
          <aside className="overflow-hidden"><PageSections path="/buyers/apply" /></aside>
          <div className="p-6 sm:p-10 lg:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Gifting teams</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] text-slate-950 sm:text-4xl">Tell us what you&apos;re planning.</h2>
          <p className="mt-3 leading-7 text-slate-600">Create your free workspace and start finding a better fit for your next gifting moment.</p>

          <form onSubmit={submit} className="mt-9 grid gap-5 sm:grid-cols-2">
            <Field name="fullName" label="Your full name" required />
            <Field name="jobTitle" label="Job title" required />
            <Field name="companyName" label="Company name" required />
            <Field name="website" label="Company website" type="url" required />
            <Field name="email" label="Work email" type="email" required />
            <Field name="password" label="Password" type="password" minLength={6} required />
            <Select name="companySize" label="Company size" options={["1–10", "11–50", "51–200", "201–1,000", "1,000+"]} />
            <Select name="budget" label="Annual gifting budget" options={["Under $10k", "$10k–$50k", "$50k–$250k", "$250k+"]} />
            <Select name="useCase" label="Primary use case" options={["Employee recognition", "Client appreciation", "Sales prospecting", "Events", "Corporate procurement"]} />
            <Field name="recipients" label="Estimated recipients" type="number" min={1} />
            <Select name="timeline" label="Desired timeline" options={["Within 30 days", "1–3 months", "3–6 months", "Exploring"]} />

            <fieldset className="sm:col-span-2">
              <legend className="mb-3 text-sm font-bold text-slate-800">Categories you are sourcing</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {opportunityCategories.slice(0, 6).map((category) => (
                  <label key={category} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-600 hover:border-indigo-300">
                    <input type="checkbox" name="categories" value={category} className="accent-indigo-600" /> {category}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-800">What are you looking for?</span>
              <textarea name="requirements" rows={4} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="Product types, quantities, customization, delivery regions…" />
            </label>

            {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>}
            <button disabled={loading} className="rounded-full bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:col-span-2">
              {loading ? "Creating your gifting account…" : "Submit gifting request"}
            </button>
          </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...input } = props;
  return <label><span className="mb-2 block text-sm font-bold text-slate-800">{label}</span><input {...input} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" /></label>;
}

function Select({ name, label, options }: { name: string; label: string; options: string[] }) {
  return <label><span className="mb-2 block text-sm font-bold text-slate-800">{label}</span><select name={name} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"><option value="">Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
