import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — GiftGrid' }

async function getMerchantData(userId: string) {
  const supabase = createServerClient()

  const [{ data: merchant }, { data: profile }] = await Promise.all([
    supabase
      .from('merchant_profiles')
      .select('id, store_url, business_name, application_status, onboarding_stage')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single(),
  ])

  if (!merchant) return null

  const [{ data: latestAudit }, { data: openRecs }, { data: unreadMsgs }, { data: submissions }] =
    await Promise.all([
      supabase
        .from('store_audits')
        .select('id, overall_score, status, created_at')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('audit_recommendations')
        .select('id, status')
        .eq('merchant_id', merchant.id)
        .eq('status', 'open'),
      supabase
        .from('merchant_communications')
        .select('id')
        .eq('merchant_id', merchant.id)
        .eq('is_read', false)
        .eq('direction', 'inbound'),
      supabase
        .from('opportunity_submissions')
        .select('id, status, submitted_at')
        .eq('merchant_id', merchant.id)
        .order('submitted_at', { ascending: false })
        .limit(5),
    ])

  return {
    merchant,
    profile,
    latestAudit,
    openRecsCount: openRecs?.length ?? 0,
    unreadCount: unreadMsgs?.length ?? 0,
    submissions: submissions ?? [],
  }
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending Review',
  in_review: 'Under Review',
  reviewed: 'Review Complete',
  submitted: 'Submitted',
  rejected: 'Not Approved',
}

const SUBMISSION_BADGE: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'var(--text-secondary)' },
  submitted: { label: 'Submitted', color: 'var(--accent)' },
  accepted: { label: 'Accepted', color: 'var(--success)' },
  declined: { label: 'Declined', color: '#F87171' },
  no_response: { label: 'No Response', color: 'var(--text-secondary)' },
}

export default async function DashboardPage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const data = await getMerchantData(user.id)
  if (!data) redirect('/auth/sign-in')

  const { merchant, profile, latestAudit, openRecsCount, unreadCount, submissions } = data

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Hello, {firstName}.</h1>
        <p className="page-sub">Here's where your store stands with GiftGrid.</p>
      </div>

      {/* STATUS RIBBON */}
      <div className="status-ribbon">
        <span className="ribbon-label">Application status</span>
        <span className="ribbon-value">
          {STATUS_LABEL[merchant.application_status] ?? merchant.application_status}
        </span>
        {merchant.store_url && (
          <a
            href={merchant.store_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ribbon-store"
          >
            {merchant.store_url.replace(/^https?:\/\//, '')}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15,3 21,3 21,9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <Link href="/dashboard/audit" className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <div className="stat-body">
            <p className="stat-label">Audit Score</p>
            <p className="stat-value">
              {latestAudit ? `${latestAudit.overall_score ?? '—'} / 100` : 'Not yet audited'}
            </p>
            <p className="stat-sub">
              {latestAudit ? `Status: ${latestAudit.status}` : 'Your store has not been reviewed yet'}
            </p>
          </div>
          <span className="stat-arrow">→</span>
        </Link>

        <Link href="/dashboard/recommendations" className="stat-card">
          <div className="stat-icon accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
            </svg>
          </div>
          <div className="stat-body">
            <p className="stat-label">Open Recommendations</p>
            <p className="stat-value">{openRecsCount}</p>
            <p className="stat-sub">{openRecsCount === 0 ? 'No open items' : 'Action may be needed'}</p>
          </div>
          <span className="stat-arrow">→</span>
        </Link>

        <Link href="/dashboard/comms" className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="stat-body">
            <p className="stat-label">Messages</p>
            <p className="stat-value">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
            <p className="stat-sub">From the GiftGrid team</p>
          </div>
          <span className="stat-arrow">→</span>
        </Link>

        <Link href="/dashboard/opportunities" className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div className="stat-body">
            <p className="stat-label">Opportunity Submissions</p>
            <p className="stat-value">{submissions.length}</p>
            <p className="stat-sub">Tracked from submission to response</p>
          </div>
          <span className="stat-arrow">→</span>
        </Link>
      </div>

      {/* RECENT SUBMISSIONS TABLE */}
      {submissions.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Recent Submissions</h2>
            <Link href="/dashboard/opportunities" className="section-link">View all →</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const badge = SUBMISSION_BADGE[s.status] ?? { label: s.status, color: 'var(--text-secondary)' }
                  return (
                    <tr key={s.id}>
                      <td className="mono">{s.id.slice(0, 8).toUpperCase()}</td>
                      <td>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className="badge" style={{ color: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <style jsx>{`
        .page-header {
          margin-bottom: 28px;
        }
        .page-title {
          font-family: var(--display);
          font-weight: 560;
          font-size: 28px;
          margin-bottom: 6px;
        }
        .page-sub {
          color: var(--text-secondary);
          font-size: 14.5px;
        }
        .status-ribbon {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          margin-bottom: 28px;
          font-size: 13.5px;
        }
        .ribbon-label {
          color: var(--text-secondary);
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ribbon-value {
          color: var(--accent);
          font-weight: 600;
        }
        .ribbon-store {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--text-secondary);
          font-family: var(--mono);
          font-size: 12px;
          transition: color 0.15s;
        }
        .ribbon-store:hover {
          color: var(--text-primary);
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 36px;
        }
        @media (max-width: 700px) {
          .stat-grid { grid-template-columns: 1fr; }
        }
        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 22px 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          transition: border-color 0.15s;
          position: relative;
        }
        .stat-card:hover {
          border-color: var(--accent-dim);
        }
        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .stat-icon.accent {
          color: var(--accent);
          background: rgba(212,175,55,0.08);
          border-color: rgba(212,175,55,0.2);
        }
        .stat-body {
          flex: 1;
          min-width: 0;
        }
        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--mono);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .stat-value {
          font-size: 19px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .stat-sub {
          font-size: 12.5px;
          color: var(--text-secondary);
        }
        .stat-arrow {
          font-size: 14px;
          color: var(--text-secondary);
          align-self: center;
        }
        .section {
          margin-top: 10px;
        }
        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
        }
        .section-link {
          font-size: 13px;
          color: var(--accent);
        }
        .table-wrap {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .data-table th {
          text-align: left;
          padding: 12px 18px;
          font-family: var(--mono);
          font-size: 10.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }
        .data-table td {
          padding: 13px 18px;
          border-bottom: 1px solid var(--border);
          color: var(--text-primary);
        }
        .data-table tr:last-child td {
          border-bottom: none;
        }
        .mono {
          font-family: var(--mono);
          font-size: 12px;
        }
        .badge {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
      `}</style>
    </>
  )
}
