import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Opportunities — GiftGrid' }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
  submitted: { label: 'Submitted', color: '#D4AF37', bg: 'rgba(212,175,55,0.1)' },
  accepted: { label: 'Accepted', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  declined: { label: 'Declined', color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
  no_response: { label: 'No Response', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
  withdrawn: { label: 'Withdrawn', color: '#94A3B8', bg: 'transparent' },
}

export default async function OpportunitiesPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: merchant } = await supabase
    .from('merchant_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard')

  const { data: submissions } = await supabase
    .from('opportunity_submissions')
    .select(`
      id, status, notes, submitted_at, response_received_at, response_notes,
      opportunity_targets (
        id, name, category, description
      )
    `)
    .eq('merchant_id', merchant.id)
    .order('submitted_at', { ascending: false })

  const active = submissions?.filter((s) => ['pending', 'submitted'].includes(s.status)) ?? []
  const resolved = submissions?.filter((s) => !['pending', 'submitted'].includes(s.status)) ?? []

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Opportunities</p>
        <h1 className="page-title">Submission Tracker</h1>
        <p className="page-sub">
          Every opportunity GiftGrid submits on your behalf — tracked from submission to response. Final
          decisions belong to the relevant organisation.
        </p>
      </div>

      {(!submissions || submissions.length === 0) ? (
        <div className="empty-state">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4l3 3" />
          </svg>
          <h2>No submissions yet</h2>
          <p>
            Once your store is reviewed and ready, the GiftGrid team will identify and pursue relevant
            opportunities on your behalf. All submissions will appear here.
          </p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="sub-section">
              <h2 className="sub-heading">Active <span className="sub-count">{active.length}</span></h2>
              {active.map((s) => <SubmissionCard key={s.id} sub={s} />)}
            </section>
          )}
          {resolved.length > 0 && (
            <section className="sub-section">
              <h2 className="sub-heading">Resolved <span className="sub-count">{resolved.length}</span></h2>
              {resolved.map((s) => <SubmissionCard key={s.id} sub={s} />)}
            </section>
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
        .page-sub { font-size: 14px; color: var(--text-secondary); line-height: 1.6; max-width: 620px; }
        .sub-section { margin-bottom: 32px; }
        .sub-heading {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sub-count {
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
        .empty-state p { font-size: 14px; max-width: 420px; line-height: 1.65; }
      `}</style>
    </>
  )
}

function SubmissionCard({ sub }: { sub: any }) {
  const cfg = STATUS_CONFIG[sub.status] ?? { label: sub.status, color: '#94A3B8', bg: 'transparent' }
  const target = sub.opportunity_targets

  return (
    <div className="sub-card">
      <div className="sub-top">
        <div className="sub-id">
          <span className="id-label">REF</span>
          <span className="id-val">{sub.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <span className="status-chip" style={{ color: cfg.color, background: cfg.bg }}>
          {cfg.label}
        </span>
      </div>

      {target && (
        <div className="target-block">
          <p className="target-name">{target.name}</p>
          {target.category && <p className="target-cat">{target.category}</p>}
          {target.description && <p className="target-desc">{target.description}</p>}
        </div>
      )}

      <div className="sub-timeline">
        {sub.submitted_at && (
          <div className="timeline-item">
            <span className="tl-label">Submitted</span>
            <span className="tl-val">{new Date(sub.submitted_at).toLocaleDateString()}</span>
          </div>
        )}
        {sub.response_received_at && (
          <div className="timeline-item">
            <span className="tl-label">Response received</span>
            <span className="tl-val">{new Date(sub.response_received_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {sub.notes && (
        <p className="sub-notes">{sub.notes}</p>
      )}
      {sub.response_notes && (
        <div className="response-block">
          <p className="response-label">Response notes</p>
          <p className="response-text">{sub.response_notes}</p>
        </div>
      )}

      <style jsx>{`
        .sub-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px 22px;
          margin-bottom: 10px;
        }
        .sub-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .sub-id {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .id-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--text-secondary);
        }
        .id-val {
          font-family: var(--mono);
          font-size: 13px;
          font-weight: 600;
        }
        .status-chip {
          font-family: var(--mono);
          font-size: 10.5px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .target-block { margin-bottom: 14px; }
        .target-name { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
        .target-cat {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .target-desc { font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; }
        .sub-timeline {
          display: flex;
          gap: 20px;
          margin-bottom: 10px;
        }
        .timeline-item { display: flex; flex-direction: column; gap: 2px; }
        .tl-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .tl-val { font-size: 13px; }
        .sub-notes { font-size: 13.5px; color: var(--text-secondary); margin-top: 10px; }
        .response-block {
          margin-top: 14px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 6px;
        }
        .response-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .response-text { font-size: 13.5px; line-height: 1.6; }
      `}</style>
    </div>
  )
}
