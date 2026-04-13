'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Search, Bell, Settings, User } from 'lucide-react'

const TABS = [
  { href: '/incidents', label: 'DHAKA NOC'  },
  { href: '/backhaul',  label: 'BACKHAUL'   },
  { href: '/logs',      label: 'EVENTS LOG' },
  { href: '/analytics', label: 'ANALYTICS'  },
]

export function TopNav() {
  const path = usePathname()
  return (
    <header
      className="h-14 flex items-center px-6"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(26,28,32,0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <nav className="flex gap-1">
        {TABS.map(({ href, label }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="px-4 py-1.5 text-xs font-semibold tracking-widest rounded transition-all"
              style={{
                background: active ? 'rgba(195,245,255,0.08)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'rgba(226,226,232,0.4)',
              }}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="ml-auto flex items-center gap-4" style={{ color: 'rgba(226,226,232,0.4)' }}>
        <button className="transition-colors hover:opacity-80"><Search className="w-4 h-4" /></button>
        <button className="transition-colors hover:opacity-80 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: 'var(--color-error)' }} />
        </button>
        <button className="transition-colors hover:opacity-80"><Settings className="w-4 h-4" /></button>
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(195,245,255,0.15)' }}>
          <User className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
    </header>
  )
}
