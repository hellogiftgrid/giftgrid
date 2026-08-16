'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Store Audit',
    href: '/dashboard/audit',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    label: 'Recommendations',
    href: '/dashboard/recommendations',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
      </svg>
    ),
  },
  {
    label: 'Documents',
    href: '/dashboard/documents',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/dashboard/comms',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Opportunities',
    href: '/dashboard/opportunities',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20v-2a6 6 0 0 1 12 0v2" />
      </svg>
    ),
  },
]

export default function MerchantSidebar() {
  const path = usePathname()

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-dot" />
          <span className="logo-text">GiftGrid</span>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Workspace</p>
          {NAV.map((item) => {
            const active =
              item.href === '/dashboard'
                ? path === '/dashboard'
                : path.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link${active ? ' active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <form action="/auth/sign-out" method="POST">
            <button type="submit" className="sign-out-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <style jsx>{`
        .sidebar {
          width: 230px;
          min-height: 100vh;
          background: var(--bg-secondary-soft);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 22px 22px 20px;
          border-bottom: 1px solid var(--border);
          font-family: var(--display);
          font-weight: 560;
          font-size: 19px;
        }
        .logo-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          flex-shrink: 0;
        }
        .sidebar-nav {
          flex: 1;
          padding: 20px 14px;
          overflow-y: auto;
        }
        .sidebar-section-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
          padding: 0 8px;
          margin-bottom: 10px;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 10px;
          border-radius: 5px;
          font-size: 14px;
          color: var(--text-secondary);
          transition: color 0.15s, background 0.15s;
          margin-bottom: 2px;
        }
        .sidebar-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }
        .sidebar-link.active {
          color: var(--accent);
          background: rgba(212, 175, 55, 0.08);
        }
        .sidebar-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .sidebar-footer {
          padding: 16px 14px;
          border-top: 1px solid var(--border);
        }
        .sign-out-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 9px 10px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 13.5px;
          font-family: var(--body);
          cursor: pointer;
          border-radius: 5px;
          transition: color 0.15s, background 0.15s;
        }
        .sign-out-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }
      `}</style>
    </>
  )
}
