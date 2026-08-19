import { createClient } from '@/lib/supabase/server'
import { redirect, revalidatePath } from 'next/navigation'

export const metadata = {
  title: 'Messages — GiftGrid',
}

async function startConversation(formData: FormData) {
  'use server'

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const subject = String(formData.get('subject') || '').trim()
  const body = String(formData.get('body') || '').trim()

  if (!subject || !body) return

  const { data: merchant } = await supabase
    .from('merchant_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard')

  const { data: thread, error: threadError } = await supabase
    .from('message_threads')
    .insert({
      merchant_id: merchant.id,
      subject,
    })
    .select('id')
    .single()

  if (threadError || !thread) {
    throw new Error(
      threadError?.message || 'Unable to create conversation'
    )
  }

  const { error: messageError } = await supabase
    .from('messages')
    .insert({
      thread_id: thread.id,
      sender_id: user.id,
      body,
    })

  if (messageError) {
    throw new Error(messageError.message)
  }

  revalidatePath('/dashboard/comms')
}

export default async function MessagesPage() {
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

  const { data: threads } = await supabase
    .from('message_threads')
    .select('id, subject, created_at')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  const threadIds = (threads || []).map((thread) => thread.id)

  const { data: messages } = threadIds.length
    ? await supabase
        .from('messages')
        .select('id, thread_id, sender_id, body, is_read, created_at')
        .in('thread_id', threadIds)
        .order('created_at')
    : { data: [] }

  return (
    <div className="min-h-full bg-[#F7F9FC] -m-10 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-7">

        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-[#4F46E5]">
            Messages
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            GiftGrid support
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Contact the GiftGrid team about your account, audit or opportunities.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          <div className="space-y-4">
            {!threads?.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  No conversations yet
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Start a conversation with GiftGrid support.
                </p>
              </div>
            ) : (
              threads.map((thread) => {
                const threadMessages = (messages || []).filter(
                  (message) => message.thread_id === thread.id
                )

                return (
                  <article
                    key={thread.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-sm font-bold text-slate-900">
                        {thread.subject || 'GiftGrid conversation'}
                      </h2>

                      <span className="text-[11px] text-slate-400">
                        {new Date(thread.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {threadMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`rounded-xl p-4 ${
                            message.sender_id === user.id
                              ? 'ml-8 bg-indigo-50'
                              : 'mr-8 bg-slate-50'
                          }`}
                        >
                          <p className="text-sm leading-6 text-slate-700">
                            {message.body}
                          </p>

                          <p className="mt-2 text-[10px] text-slate-400">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                )
              })
            )}
          </div>

          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#4F46E5]">
              New conversation
            </p>

            <h2 className="mt-2 text-lg font-bold text-slate-900">
              Contact GiftGrid
            </h2>

            <form action={startConversation} className="mt-5 space-y-4">
              <input
                name="subject"
                required
                placeholder="Subject"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />

              <textarea
                name="body"
                required
                rows={7}
                placeholder="How can we help?"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white hover:bg-[#4338CA]"
              >
                Send message
              </button>
            </form>
          </section>

        </div>
      </div>
    </div>
  )
}
