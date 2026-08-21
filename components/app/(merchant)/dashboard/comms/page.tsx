import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CommsThread from '@/components/merchant/CommsThread'

export const metadata = { title: 'Messages — GiftGrid' }

export default async function CommsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: merchant } = await supabase
    .from('merchant_profiles')
    .select('id, business_name')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard')

  const { data: messages } = await supabase
    .from('merchant_communications')
    .select('id, subject, body, direction, sent_at, is_read, sender_name')
    .eq('merchant_id', merchant.id)
    .order('sent_at', { ascending: true })

  // Mark unread inbound as read
  const unreadIds = (messages ?? [])
    .filter((m) => !m.is_read && m.direction === 'inbound')
    .map((m) => m.id)

  if (unreadIds.length > 0) {
    await supabase
      .from('merchant_communications')
      .update({ is_read: true })
      .in('id', unreadIds)
  }

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Messages</p>
        <h1 className="page-title">GiftGrid Communications</h1>
        <p className="page-sub">
          Messages from the GiftGrid team about your account, audit, and opportunities.
          To reply, use the form below or email{' '}
          <a href="mailto:support@degiftgrid.com" className="email-link">
            support@degiftgrid.com
          </a>
          .
        </p>
      </div>

      <CommsThread messages={messages ?? []} merchantName={merchant.business_name ?? 'You'} />

      <style jsx>{`
        .page-header { margin-bottom: 28px; }
        .eyebrow {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 8px;
        }
        .page-title {
          font-family: var(--display);
          font-weight: 560;
          font-size: 26px;
          margin-bottom: 8px;
        }
        .page-sub { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        .email-link { color: var(--accent); }
      `}</style>
    </>
  )
}
