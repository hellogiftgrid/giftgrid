import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'Store Audit — GiftGrid',
}

export default async function AuditPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const { data: merchant } = await supabase
    .from('merchant_profiles')
    .select('id, business_name, store_url')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard')

  const { data: audits } = await supabase
    .from('audits')
    .select(`
      id,
      status,
      overall_score,
      executive_summary,
      published_at,
      created_at
    `)
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  const audit = audits?.find(
    (item) => item.status === 'approved' || item.published_at
  ) || audits?.[0]

  if (!audit) {
    return (
      <div className="min-h-full bg-[#F7F9FC] -m-10 p-6 lg:p-10">
        <div className="mx-auto max-w-5xl space-y-7">
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-[#4F46E5]">
              Store Audit
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Your GiftGrid audit
            </h1>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-[#4F46E5]">
              ✓
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Audit not available yet
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              GiftGrid has not published an audit for your business yet.
              Complete your business information while you wait.
            </p>

            <Link
              href="/dashboard/profile"
              className="mt-5 inline-flex rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white"
            >
              Complete profile →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { data: sections } = await supabase
    .from('audit_sections')
    .select('id, title, description, score, sort_order')
    .eq('audit_id', audit.id)
    .eq('is_visible', true)
    .order('sort_order')

  const sectionIds = (sections || []).map((section) => section.id)

  const { data: findings } = sectionIds.length
    ? await supabase
        .from('audit_findings')
        .select(`
          id,
          section_id,
          title,
          description,
          status,
          severity,
          what_was_checked,
          why_it_matters,
          recommendation,
          evidence,
          screenshot_url,
          sort_order
        `)
        .in('section_id', sectionIds)
        .order('sort_order')
    : { data: [] }

  return (
    <div className="min-h-full bg-[#F7F9FC] -m-10 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-7">

        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-[#4F46E5]">
            Store Audit
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Store Performance Audit
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {merchant.business_name}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Overall score
            </p>
            <p className="mt-3 text-4xl font-bold text-[#4F46E5]">
              {audit.overall_score ?? '—'}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Status
            </p>
            <p className="mt-3 text-2xl font-bold capitalize text-slate-900">
              {audit.status}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Published
            </p>
            <p className="mt-3 text-lg font-bold text-slate-900">
              {audit.published_at
                ? new Date(audit.published_at).toLocaleDateString()
                : 'Pending'}
            </p>
          </div>
        </div>

        {audit.executive_summary && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Executive summary
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {audit.executive_summary}
            </p>
          </div>
        )}

        <div className="space-y-5">
          {(sections || []).map((section) => {
            const sectionFindings = (findings || []).filter(
              (item) => item.section_id === section.id
            )

            return (
              <section
                key={section.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {section.score !== null && (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-[#4F46E5]">
                      {section.score}/100
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  {sectionFindings.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No findings published.
                    </p>
                  ) : (
                    sectionFindings.map((finding) => (
                      <article
                        key={finding.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              {finding.title}
                            </h3>

                            {finding.description && (
                              <p className="mt-2 text-xs leading-6 text-slate-600">
                                {finding.description}
                              </p>
                            )}

                            {finding.why_it_matters && (
                              <p className="mt-2 text-xs leading-6 text-slate-500">
                                <strong>Why it matters:</strong>{' '}
                                {finding.why_it_matters}
                              </p>
                            )}

                            {finding.recommendation && (
                              <p className="mt-2 text-xs leading-6 text-slate-600">
                                <strong>Recommendation:</strong>{' '}
                                {finding.recommendation}
                              </p>
                            )}
                          </div>

                          <span className="h-fit shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-bold capitalize text-slate-600 ring-1 ring-slate-200">
                            {String(finding.status || 'not_tested').replaceAll('_', ' ')}
                          </span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
