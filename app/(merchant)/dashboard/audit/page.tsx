"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AuditPdfButton from "@/components/merchant/AuditPdfButton";
import HireExpertButton from "@/components/merchant/HireExpertButton";

const SECTIONS = [
  "Store Presentation",
  "Brand Identity",
  "Product Readiness",
  "Operational Credibility",
  "Compliance",
];

type Audit = {
  id: string;
  status: string;
  overall_score: number | null;
  executive_summary: string | null;
  created_at: string;
  published_at: string | null;
};

type Section = {
  id: string;
  title: string;
  description: string | null;
  score: number | null;
};

type Finding = {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  status: string | null;
  severity: string | null;
  what_was_checked: string | null;
  why_it_matters: string | null;
  recommendation: string | null;
};

export default function AuditPage() {
  const supabase = createClient();

  const [audit, setAudit] = useState<Audit | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [activeSection, setActiveSection] =
    useState("Store Presentation");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function loadAudit() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/sign-in";
      return;
    }

    const { data: merchant, error: merchantError } =
      await supabase
        .from("merchant_profiles")
        .select("id, business_name, store_url")
        .eq("user_id", user.id)
        .maybeSingle();

    if (merchantError) {
      setError(merchantError.message);
      setLoading(false);
      return;
    }

    if (!merchant) {
      setError("Merchant profile not found.");
      setLoading(false);
      return;
    }

    setMerchantId(merchant.id);
    setBusinessName(merchant.business_name || "");
    setStoreUrl(merchant.store_url || "");

    const { data: latestAudit, error: auditError } =
      await supabase
        .from("audits")
        .select(
          "id, status, overall_score, executive_summary, created_at, published_at"
        )
        .eq("merchant_id", merchant.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (auditError) {
      setError(auditError.message);
      setLoading(false);
      return;
    }

    if (!latestAudit) {
      setAudit(null);
      setSections([]);
      setFindings([]);
      setLoading(false);
      return;
    }

    setAudit(latestAudit);

    const { data: sectionRows, error: sectionError } =
      await supabase
        .from("audit_sections")
        .select(
          "id, title, description, score"
        )
        .eq("audit_id", latestAudit.id)
        .order("sort_order");

    if (sectionError) {
      setError(sectionError.message);
      setLoading(false);
      return;
    }

    const safeSections = (sectionRows || []).filter(
      (section) => SECTIONS.includes(section.title)
    );

    setSections(safeSections);

    const sectionIds = safeSections.map(
      (section) => section.id
    );

    if (sectionIds.length) {
      const { data: findingRows, error: findingError } =
        await supabase
          .from("audit_findings")
          .select(
            "id, section_id, title, description, status, severity, what_was_checked, why_it_matters, recommendation"
          )
          .in("section_id", sectionIds)
          .order("sort_order");

      if (findingError) {
        setError(findingError.message);
      } else {
        setFindings(findingRows || []);
      }
    }

    setLoading(false);
  }

  async function runAudit() {
    setRunning(true);
    setError("");

    const response = await fetch(
      "/api/audit/run",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Audit failed.");
      setRunning(false);
      return;
    }

    await loadAudit();
    setRunning(false);
  }

  useEffect(() => {
    loadAudit();
  }, []);

  const selectedSection = sections.find(
    (section) => section.title === activeSection
  );

  const selectedFindings = useMemo(
    () =>
      selectedSection
        ? findings.filter(
            (finding) =>
              finding.section_id ===
              selectedSection.id
          )
        : [],
    [findings, selectedSection]
  );

  const nextSteps = findings
    .filter(
      (finding) =>
        finding.status !== "passed" &&
        finding.recommendation
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-full bg-[#F7F9FC] p-6 lg:p-10">
        <div className="mx-auto max-w-[1200px] animate-pulse">
          <div className="h-10 w-72 rounded bg-slate-200" />
          <div className="mt-3 h-5 w-96 rounded bg-slate-200" />
          <div className="mt-10 h-80 rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F7F9FC] p-6 lg:p-10">
      <div className="mx-auto max-w-[1200px]">

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4F46E5]">
              Store Audit
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {businessName || "Your Store"} audit
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {storeUrl || "Add your store URL to begin."}
            </p>
          </div>

          {audit && (
            <div className="flex flex-wrap gap-3">
              <HireExpertButton
                source="audit"
                storeName={businessName}
              />
              <AuditPdfButton
                businessName={businessName}
                storeUrl={storeUrl}
                audit={audit}
                sections={sections}
                findings={findings}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!audit ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Start your GiftGrid Store Audit
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              GiftGrid will inspect the live storefront, assess the five
              audit areas, generate recommendations, and send the report
              to admin review.
            </p>

            <button
              onClick={runAudit}
              disabled={running || !storeUrl}
              className="mt-7 rounded-xl bg-[#4F46E5] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running
                ? "Running real store audit…"
                : "Run Store Audit →"}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      GiftGrid Grid Level Audit
                    </p>

                    <h2 className="mt-2 text-4xl font-bold text-slate-950">
                      {audit.overall_score ?? 0}
                      <span className="text-xl text-slate-400">
                        /100
                      </span>
                    </h2>
                  </div>

                  <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-[#4F46E5]">
                    {audit.status.replaceAll("_", " ")}
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {SECTIONS.map((name) => {
                    const section = sections.find(
                      (item) => item.title === name
                    );

                    const score = section?.score ?? 0;

                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setActiveSection(name)}
                        className={`w-full rounded-xl p-4 text-left transition ${
                          activeSection === name
                            ? "bg-indigo-50 ring-1 ring-indigo-100"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">
                            {name}
                          </span>

                          <span className="text-sm font-bold text-[#4F46E5]">
                            {score}
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#4F46E5] transition-all"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, score)
                              )}%`,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Audit Verdict
                </p>

                <h3 className="mt-3 text-2xl font-bold text-slate-950">
                  {(audit.overall_score ?? 0) >= 75
                    ? "Grid Ready"
                    : (audit.overall_score ?? 0) >= 50
                      ? "Grid Pending"
                      : "Grid Not Ready"}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  {audit.executive_summary ||
                    "Your GiftGrid audit is ready for review."}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Interactive Findings
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {activeSection}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Click a section above to explore the evidence,
                  explanation, and recommendation.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {selectedFindings.map((finding) => (
                  <details
                    key={finding.id}
                    className="group p-6"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-slate-950">
                            {finding.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {finding.status?.replaceAll("_", " ")}
                          </p>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                          {finding.severity || "medium"}
                        </span>
                      </div>
                    </summary>

                    <div className="mt-5 grid gap-5 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          What was checked
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {finding.what_was_checked ||
                            "The storefront was checked against the GiftGrid audit criteria."}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Why it matters
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {finding.why_it_matters ||
                            finding.description ||
                            "This can affect merchant readiness and buyer confidence."}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Recommendation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {finding.recommendation ||
                            "Review this area and make the recommended improvement."}
                        </p>
                      </div>
                    </div>
                  </details>
                ))}

                {!selectedFindings.length && (
                  <div className="p-8 text-sm text-slate-500">
                    No findings were returned for this section.
                  </div>
                )}
              </div>
            </div>

            {nextSteps.length > 0 && (
              <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F46E5]">
                  Next Steps
                </p>

                <div className="mt-4 space-y-3">
                  {nextSteps.map((finding) => (
                    <div
                      key={finding.id}
                      className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
                    >
                      {finding.recommendation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={runAudit}
              disabled={running || !storeUrl}
              className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              {running
                ? "Running again…"
                : "Run Fresh Audit"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
