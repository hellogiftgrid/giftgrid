import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Store Audit — GiftGrid' }

const RESULT_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  passed: { label: 'Passed', color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
  failed: { label: 'Needs Attention', color: '#F87171', bg: 'rgba(248,113,113,0.08)' },
  manual_review: { label: 'Manual Review', color: '#FACC15', bg: 'rgba(250,204,21,0.08)' },
  not_checked: { label: 'Not Checked', color: 'var(--text-secondary)', bg: 'transparent' },
}

export default async function AuditPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: merchant } = await supabase
    .from('merchant_profiles')
    .select('id, business_name, store_url')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard')

  const { data: audits } = await supabase
    .from('store_audits')
    .select('id, overall_score, status, summary, audited_at, created_at')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  const latestAudit = audits?.[0] ?? null

  const { data: items } = latestAudit
    ? await supabase
        .from('audit_items')
        .select('id, category, check_name, result, detail, evidence_url, severity')
        .eq('audit_id', latestAudit.id)
        .order('category')
    : { data: [] }

  // Group by category
  const grouped: Record<string, typeof items> = {}
  for (const item of items ?? []) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category]!.push(item)
  }

  const categories = Object.keys(grouped)

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">Store Audit</p>
          <h1 className="page-title">
            {merchant.business_name ?? 'Your Store'} — Audit Report
          </h1>
          {merchant.store_url && (
            <a href={merchant.store_url} target="_blank" rel="noopener noreferrer" className="store-link">
              {merchant.store_url.replace(/^https?:\/\//, '')} ↗
            </a>
          )}
        </div>
        {latestAudit && (
          <div className="score-badge">
            <span className="score-num">{latestAudit.overall_score ?? '—'}</span>
            <span className="score-label">/ 100</span>
          </div>
        )}
      </div>

      {!latestAudit ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h2>No audit yet</h2>
          <p>Your store hasn't been reviewed by the GiftGrid team yet. We'll notify you when your audit is ready.</p>
        </div>
      ) : (
        <>
          {latestAudit.summary && (
            <div className="audit-summary">
              <p className="summary-eyebrow">Summary</p>
              <p className="summary-text">{latestAudit.summary}</p>
            </div>
          )}

          <div className="audit-meta">
            <span>
              Status: <strong>{latestAudit.status}</strong>
            </span>
            {latestAudit.audited_at && (
              <span>
                Audited: <strong>{new Date(latestAudit.audited_at).toLocaleDateString()}</strong>
              </span>
            )}
          </div>

          {categories.length === 0 ? (
            <p className="muted">No individual audit items yet for this audit.</p>
          ) : (
            <div className="categories">
              {categories.map((cat) => (
                <div key={cat} className="category-block">
                  <h3 className="cat-title">{cat}</h3>
                  <div className="items-table">
                    {grouped[cat]!.map((item) => {
                      const style = RESULT_STYLE[item.result] ?? RESULT_STYLE.not_checked
                      return (
                        <div key={item.id} className="audit-row">
                          <div className="audit-row-main">
                            <span className="check-name">{item.check_name}</span>
                            <span
                              className="result-chip"
                              style={{ color: style.color, background: style.bg }}
                            >
                              {style.label}
                            </span>
                          </div>
                          {item.detail && <p className="check-detail">{item.detail}</p>}
                          {item.evidence_url && (
                            <a
                              href={item.evidence_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="evidence-link"
                            >
                              View evidence ↗
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }
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
          font-size: 24px;
          margin-bottom: 6px;
        }
        .store-link {
          font-size: 13px;
          color: var(--text-secondary);
          font-family: var(--mono);
        }
        .store-link:hover { color: var(--text-primary); }
        .score-badge {
          flex-shrink: 0;
          display: flex;
          align-items: baseline;
          gap: 4px;
          background: rgba(212,175,55,0.1);
          border: 1px solid var(--accent-dim);
          border-radius: 10px;
          padding: 14px 22px;
        }
        .score-num {
          font-family: var(--display);
          font-size: 36px;
          font-weight: 560;
          color: var(--accent);
        }
        .score-label {
          font-family: var(--mono);
          font-size: 14px;
          color: var(--text-secondary);
        }
        .audit-summary {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px 22px;
          margin-bottom: 18px;
        }
        .summary-eyebrow {
          font-family: var(--mono);
          font-size: 10.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .summary-text {
          font-size: 14.5px;
          line-height: 1.65;
          color: var(--text-primary);
        }
        .audit-meta {
          display: flex;
          gap: 24px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 28px;
        }
        .audit-meta strong { color: var(--text-primary); }
        .categories { display: flex; flex-direction: column; gap: 24px; }
        .category-block {}
        .cat-title {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
        .items-table { display: flex; flex-direction: column; gap: 2px; }
        .audit-row {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 14px 18px;
        }
        .audit-row-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
        }
        .check-name {
          font-size: 14px;
          font-weight: 500;
        }
        .result-chip {
          font-family: var(--mono);
          font-size: 10.5px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
          white-space: nowrap;
        }
        .check-detail {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-top: 5px;
        }
        .evidence-link {
          font-size: 12px;
          color: var(--accent);
          font-family: var(--mono);
          margin-top: 6px;
          display: inline-block;
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
        .empty-state p { font-size: 14px; max-width: 380px; line-height: 1.6; }
        .muted { color: var(--text-secondary); font-size: 14px; }
      `}</style>
    </>
  )
}
