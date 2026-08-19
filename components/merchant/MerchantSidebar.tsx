'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'grid',
  },
  {
    label: 'Store Audit',
    href: '/dashboard/audit',
    icon: 'check',
  },
  {
    label: 'Recommendations',
    href: '/dashboard/recommendations',
    icon: 'star',
  },
  {
    label: 'Documents',
    href: '/dashboard/documents',
    icon: 'file',
  },
  {
    label: 'Messages',
    href: '/dashboard/comms',
    icon: 'message',
  },
  {
    label: 'Opportunities',
    href: '/dashboard/opportunities',
    icon: 'target',
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: 'user',
  },
]

function Icon({ type }: { type: string }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
  }

  if (type === 'check') {
    return (
      <svg {...common}>
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    )
  }

  if (type === 'star') {
    return (
      <svg {...common}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
      </svg>
    )
  }

  if (type === 'file') {
    return (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    )
  }

  if (type === 'message') {
    return (
      <svg {...common}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  }

  if (type === 'target') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M21 12h-2M12 21v-2M3 12h2" />
      </svg>
    )
  }

  if (type === 'user') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20v-2a6 6 0 0 1 12 0v2" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export default function MerchantSidebar() {
  const path = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white">

      <div className="flex h-[88px] items-center border-b border-slate-200 px-6">
        <Link href="/dashboard" className="block">
          <Image
            src="/images/logo-full.png"
            alt="GiftGrid"
            width={150}
            height={42}
            priority
            className="h-auto w-[150px] object-contain object-left"
          />
        </Link>
      </div>

      <div className="px-4 pt-6">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-3">
        {NAV.map((item) => {
          const active =
            item.href === '/dashboard'
              ? path === '/dashboard'
              : path.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                active
                  ? 'bg-blue-50 text-[#4F46E5] shadow-sm ring-1 ring-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={active ? 'text-[#4F46E5]' : 'text-slate-400'}>
                <Icon type={item.icon} />
              </span>
              {item.label}
              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-[#4F46E5]" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <form action="/auth/sign-out" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
