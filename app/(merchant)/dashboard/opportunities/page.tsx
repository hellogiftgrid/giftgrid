import { createClient } from '@/lib/supabase/server'
import { redirect, revalidatePath } from 'next/cache'

export const metadata = {
  title: 'Opportunities — GiftGrid',
}

async function saveOpportunity(formData: FormData) {
  'use server'

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const opportunityId = String(formData.get('opportunityId') || '')

  if (!opportunityId) return

  const { data: merchant } = await supabase
    .from('merchant_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard')

  const { data: existing } = await supabase
    .from('opportunity_submissions')
    .select('id')
    .eq('merchant_id', merchant.id)
    .eq('opportunity_id', opportunityId)
    .maybeSingle()

  if (!existing) {
    await supabase.from('opportunity_submissions').insert({
      merchant_id: merchant.id,
      opportunity_id: opportunityId,
      submitted_by: user.id,
      status: 'draft',
    })
  }

  revalidatePath('/dashboard/opportunities')
}

export default async function OpportunitiesPage() {
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

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select(`
      id,
      company_name,
      logo_url,
      website,
      category,
      relationship_label,
      description,
      requirements,
      submission_url
    `)
    .eq('is_active', true)
    .eq('is_public', true)
    .order('company_name')

  const { data: submissions } = await supabase
    .from('opportunity_submissions')
    .select('opportunity_id, status')
    .eq('merchant_id', merchant.id)

  const states = new Map(
    (submissions || []).map((item) => [item.opportunity_id, item.status])
  )

  return (
    <div className="min-h-full bg-[#F7F9FC] -m-10 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-7">

        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-[#4F46E5]">
            Opportunity Network
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Opportunities
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Find pathways that may fit {merchant.business_name}.
          </p>
        </div>

        {!opportunities?.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              No opportunities published yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              The GiftGrid team will publish opportunities here as they become available.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((item) => {
              const state = states.get(item.id)

              return (
                <article
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        {item.category || 'Opportunity'}
                      </p>

                      <h2 className="mt-2 text-lg font-bold text-slate-900">
                        {item.company_name}
                      </h2>
                    </div>

                    {item.relationship_label && (
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-[#4F46E5]">
                        {item.relationship_label}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">
                    {item.description || 'No additional description published.'}
                  </p>

                  {item.requirements && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Requirements
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {item.requirements}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex gap-2">
                    <form action={saveOpportunity} className="flex-1">
                      <input
                        type="hidden"
                        name="opportunityId"
                        value={item.id}
                      />

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#4F46E5] px-4 py-3 text-xs font-bold text-white hover:bg-[#4338CA]"
                      >
                        {state ? `Saved • ${state}` : 'Save opportunity'}
                      </button>
                    </form>

                    {item.submission_url && (
                      <a
                        href={item.submission_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Apply ↗
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
