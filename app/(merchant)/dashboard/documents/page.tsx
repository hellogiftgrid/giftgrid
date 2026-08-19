import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Documents — GiftGrid',
}

export default async function DocumentsPage() {
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

  const { data: documents } = await supabase
    .from('documents')
    .select(`
      id,
      title,
      file_url,
      file_type,
      created_at
    `)
    .eq('merchant_id', merchant.id)
    .eq('is_visible_to_merchant', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-full bg-[#F7F9FC] -m-10 p-6 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-7">

        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-[#4F46E5]">
            Documents
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Your documents
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Documents shared with {merchant.business_name}.
          </p>
        </div>

        {!documents?.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-[#4F46E5]">
              ▣
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No documents yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Documents will appear here when the GiftGrid team shares them.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-[#4F46E5]">
                    {document.file_type?.toUpperCase() || 'FILE'}
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {document.title}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(document.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#4F46E5] px-4 py-3 text-center text-xs font-bold text-white hover:bg-[#4338CA]"
                >
                  Open document ↗
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
