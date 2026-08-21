import HireExpertButton from "@/components/merchant/HireExpertButton";
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Recommendations — GiftGrid',
}

export default async function RecommendationsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const { data: merchant } = await supabase
    .from('merchant_profiles')
    .select('id, business_name')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard')

  const { data: audits } = await supabase
    .from('audits')
    .select('id, created_at, overall_score')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  const auditIds = (audits || []).map((audit) => audit.id)

  let findings: any[] = []

  if (auditIds.length) {
    const { data: sections } = await supabase
      .from('audit_sections')
      .select('id, title, audit_id')
      .in('audit_id', auditIds)
      .eq('is_visible', true)

    const sectionIds = (sections || []).map((section) => section.id)

    if (sectionIds.length) {
      const { data } = await supabase
        .from('audit_findings')
        .select(`
          id,
          section_id,
          title,
          description,
          status,
          severity,
          recommendation,
          why_it_matters
        `)
        .in('section_id', sectionIds)
        .not('recommendation', 'is', null)

      findings = (data || []).map((finding) => ({
        ...finding,
        sectionTitle:
          sections?.find((section) => section.id === finding.section_id)?.title ||
          'Audit finding',
      }))
    }
  }

  return (
    <div className="min-h-full bg-[#F7F9FC] -m-10 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-7">

        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-[#4F46E5]">
            Recommendations
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            What to improve next
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Recommended improvements based on your GiftGrid audit findings.
          </p>
        </div>

        {!findings.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              No recommendations yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Recommendations will appear here when GiftGrid publishes audit findings.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {findings.map((finding) => (
              <article
                key={finding.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {finding.sectionTitle}
                    </p>

                    <h2 className="mt-2 text-lg font-bold text-slate-900">
                      {finding.title}
                    </h2>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold capitalize text-[#4F46E5]">
                    {finding.severity || 'medium'}
                  </span>
                </div>

                {finding.why_it_matters && (
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {finding.why_it_matters}
                  </p>
                )}

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recommendation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {finding.recommendation}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
