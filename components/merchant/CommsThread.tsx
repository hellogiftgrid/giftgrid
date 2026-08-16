'use client'

interface Message {
  id: string
  subject: string | null
  body: string
  direction: 'inbound' | 'outbound'
  sent_at: string | null
  is_read: boolean
  sender_name: string | null
}

interface Props {
  messages: Message[]
  merchantName: string
}

export default function CommsThread({ messages, merchantName }: Props) {
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <h2>No messages yet</h2>
        <p>When the GiftGrid team sends you a message, it will appear here.</p>

        <style jsx>{`
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
      </div>
    )
  }

  return (
    <>
      <div className="thread">
        {messages.map((msg) => {
          const isFromTeam = msg.direction === 'inbound'
          return (
            <div key={msg.id} className={`msg ${isFromTeam ? 'from-team' : 'from-merchant'}`}>
              <div className="msg-meta">
                <span className="msg-sender">
                  {isFromTeam ? (msg.sender_name ?? 'GiftGrid Team') : merchantName}
                </span>
                {msg.sent_at && (
                  <span className="msg-time">
                    {new Date(msg.sent_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              {msg.subject && <p className="msg-subject">{msg.subject}</p>}
              <p className="msg-body">{msg.body}</p>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .thread {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 720px;
        }
        .msg {
          padding: 18px 20px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .from-team {
          background: var(--bg-secondary);
          border-left: 3px solid var(--accent);
          margin-right: 60px;
        }
        .from-merchant {
          background: var(--bg-secondary-soft);
          border-left: 3px solid var(--border);
          margin-left: 60px;
        }
        .msg-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .msg-sender {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .msg-time {
          font-size: 11.5px;
          color: var(--text-secondary);
          font-family: var(--mono);
        }
        .msg-subject {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .msg-body {
          font-size: 14px;
          line-height: 1.65;
          color: var(--text-primary);
          white-space: pre-wrap;
        }
      `}</style>
    </>
  )
}
