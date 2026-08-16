import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Recommendations — GiftGrid' }

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: '#FACC15' },
  in_progress: { label: 'In Progress', color: var(--accent) },
  resolved: { label: 'Resolved', color: '#22C55E' },
  dismissed: { label: 'Dismissed', color: 'var(--text-secondary)' },
}

const PRIORITY_DOT: Record<string, string> = {
  high: '#F87171',
  medium: '#FACC15',
  low: '#94A3B8',
}

export default async function RecommendationsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: merchant } = await supabase
    .from('merchant_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard')

  const { data: recs } = await supabase
    .from('audit_recommendations')
    .select('id, title, what_is_the_issue, why_it_matters, what_to_do, status, priority, category, developer_suggested, created_at')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  const open = recs?.filter((r) => r.status === 'open') ?? []
  const inProgress = recs?.filter((r) => r.status === 'in_progress') ?? []
  const resolved = recs?.filter((r) => r.status === 'resolved' || r.status === 'dismissed') ?? []

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Recommendations</p>
        <h1 className="page-title">What GiftGrid Recommends</h1>
        <p className="page-sub">
          Every recommendation answers three questions: what the issue is, why it matters, and what can be done.
        </p>
      </div>

      {(!recs || recs.length === 0) ? (
        <div className="empty-state">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
          </svg>
          <h2>No recommendations yet</h2>
          <p>Recommendations will appear here after your store audit is complete.</p>
        </div>
      ) : (
        <>
          {open.length > 0 && (
            <div className="rec-group">
              <h2 className="group-title">Open <span className="group-count">{open.length}</span></h2>
              {open.map((r) => <RecCard key={r.id} rec={r} />)}
            </div>
          )}
          {inProgress.length > 0 && (
            <div className="rec-group">
              <h2 className="group-title">In Progress <span className="group-count">{inProgress.length}</span></h2>
              {inProgress.map((r) => <RecCard key={r.id} rec={r} />)}
            </div>
          )}
          {resolved.length > 0 && (
            <div className="rec-group faded">
              <h2 className="group-title">Resolved / Dismissed <span className="group-count">{resolved.length}</span></h2>
              {resolved.map((r) => <RecCard key={r.id} rec={r} />)}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .page-header { margin-bottom: 32px; }
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
        .page-sub { font-size: 14px; color: var(--text-secondary); }
        .rec-group { margin-bottom: 36px; }
        .rec-group.faded { opacity: 0.65; }
        .group-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .group-count {
          font-family: var(--mono);
          font-size: 11px;
          padding: 2px 8px;
          border: 1px solid var(--border);
          border-radius: 100px;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
          padding: 80px 24px;
          color: var(--text-secondary);
        }
        .empty-state h2 { font-size: 18px; font-weight: 600; color: var(--text-primary); }
        .empty-state p { font-size: 14px; max-width: 360px; line-height: 1.6; }
      `}</style>
    </>
  )
}

function RecCard({ rec }: { rec: any }) {
  const status = STATUS_STYLE[rec.status] ?? { label: rec.status, color: 'var(--text-secondary)' }
  const priorityColor = PRIORITY_DOT[rec.priority] ?? '#94A3B8'

  return (
    <div className="rec-card">
      <div className="rec-header">
        <div className="rec-title-row">
          <span className="priority-dot" style={{ background: priorityColor }} title={`Priority: ${rec.priority}`} />
          <h3 className="rec-title">{rec.title}</h3>
        </div>
        <span className="status-chip" style={{ color: status.color }}>
          {status.label}
        </span>
      </div>

      {rec.category && (
        <p className="rec-category">{rec.category}</p>
      )}

      <div className="rec-body">
        {rec.what_is_the_issue && (
          <div className="rec-block">
            <p className="rec-block-label">What is the issue?</p>
            <p className="rec-block-text">{rec.what_is_the_issue}</p>
          </div>
        )}
        {rec.why_it_matters && (
          <div className="rec-block">
            <p className="rec-block-label">Why it matters</p>
            <p className="rec-block-text">{rec.why_it_matters}</p>
          </div>
        )}
        {rec.what_to_do && (
          <div className="rec-block">
            <p className="rec-block-label">What can be done</p>
            <p className="rec-block-text">{rec.what_to_do}</p>
          </div>
        )}
      </div>

      {rec.developer_suggested && (
        <div className="dev-note">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20v-2a6 6 0 0 1 12 0v2" />
          </svg>
          A trusted developer connection may be available for this item. Contact us for details.
        </div>
      )}

      <style jsx>{`
        .rec-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px 22px;
          margin-bottom: 10px;
        }
        .rec-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 6px;
        }
        .rec-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .priority-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .rec-title {
          font-size: 15px;
          font-weight: 600;
        }
        .status-chip {
          font-family: var(--mono);
          font-size: 10.5px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .rec-category {
          font-size: 11.5px;
          font-family: var(--mono);
          color: var(--text-secondary);
          margin-bottom: 16px;
          margin-left: 18px;
        }
        .rec-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 14px;
        }
        .rec-block {}
        .rec-block-label {
          font-family: var(--mono);
          font-size: 10.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        .rec-block-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-primary);
        }
        .dev-note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          padding: 10px 14px;
          background: rgba(212,175,55,0.07);
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 6px;
          font-size: 13px;
          color: var(--accent);
        }
      `}</style>
    </div>
  )
}
