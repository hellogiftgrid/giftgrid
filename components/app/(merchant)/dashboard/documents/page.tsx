import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Documents — GiftGrid' }

const DOC_ICON: Record<string, JSX.Element> = {
  report: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  ),
  contract: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  other: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  ),
}

export default async function DocumentsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: merchant } = await supabase
    .from('merchant_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard')

  const { data: docs } = await supabase
    .from('merchant_documents')
    .select('id, title, document_type, file_url, description, created_at, is_visible_to_merchant')
    .eq('merchant_id', merchant.id)
    .eq('is_visible_to_merchant', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Documents</p>
        <h1 className="page-title">Your Files & Reports</h1>
        <p className="page-sub">Documents shared by the GiftGrid team — reports, findings, and relevant files.</p>
      </div>

      {(!docs || docs.length === 0) ? (
        <div className="empty-state">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
          <h2>No documents yet</h2>
          <p>The GiftGrid team will upload relevant reports and files here when they're ready.</p>
        </div>
      ) : (
        <div className="doc-list">
          {docs.map((doc) => (
            <div key={doc.id} className="doc-row">
              <div className="doc-icon">
                {DOC_ICON[doc.document_type] ?? DOC_ICON.other}
              </div>
              <div className="doc-body">
                <p className="doc-title">{doc.title}</p>
                {doc.description && <p className="doc-desc">{doc.description}</p>}
                <p className="doc-meta">
                  <span className="doc-type">{doc.document_type}</span>
                  <span>·</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </p>
              </div>
              {doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doc-download"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
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
        .doc-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .doc-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 18px 20px;
          transition: border-color 0.15s;
        }
        .doc-row:hover { border-color: var(--accent-dim); }
        .doc-icon {
          width: 38px;
          height: 38px;
          border-radius: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }
        .doc-body { flex: 1; min-width: 0; }
        .doc-title { font-size: 14.5px; font-weight: 600; margin-bottom: 4px; }
        .doc-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; line-height: 1.5; }
        .doc-meta {
          display: flex;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--mono);
        }
        .doc-type { text-transform: uppercase; letter-spacing: 0.06em; }
        .doc-download {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid var(--border);
          border-radius: 5px;
          font-size: 13px;
          color: var(--text-secondary);
          white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
          align-self: center;
          flex-shrink: 0;
        }
        .doc-download:hover { color: var(--accent); border-color: var(--accent-dim); }
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
