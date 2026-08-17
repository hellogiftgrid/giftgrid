interface TopbarProps {
  profile: {
    full_name: string | null
    email: string | null
    role: string
  }
}

export default function MerchantTopbar({ profile }: TopbarProps) {
  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??'

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          {/* Breadcrumb injected by child pages via slot — left empty here */}
        </div>
        <div className="topbar-right">
          <span className="status-badge">
            <span className="status-dot" />
            Merchant
          </span>
          <div className="avatar" title={profile.full_name ?? profile.email ?? ''}>
            {initials}
          </div>
        </div>
      </header>

      <style jsx>{`
        .topbar {
          height: 58px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 36px;
          background: var(--bg-secondary-soft);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 5px 12px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 6px var(--success);
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent);
          color: #0b0f19;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: default;
          user-select: none;
        }
      `}</style>
    </>
  )
}
