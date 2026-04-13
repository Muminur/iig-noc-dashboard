'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AlertTriangle, FileText, Network, BarChart2, Settings, Zap, HelpCircle, Archive } from 'lucide-react'

const NAV = [
  { href: '/incidents',  label: 'Incidents',  icon: AlertTriangle },
  { href: '/logs',       label: 'Logs',        icon: FileText },
  { href: '/backhaul',   label: 'Backhaul',    icon: Network },
  { href: '/analytics',  label: 'Analytics',   icon: BarChart2 },
  { href: '/system',     label: 'System',      icon: Settings },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[220px] flex flex-col z-30"
      style={{
        backgroundColor: 'var(--color-surface-low)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="font-bold text-sm tracking-widest uppercase" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
          Sentinel NOC
        </p>
        <p className="text-[10px] mt-0.5 tracking-wider" style={{ color: 'rgba(226,226,232,0.4)' }}>IIG · BSCPLC</p>
        <span className="mt-2 inline-flex items-center gap-1.5 text-[9px]" style={{ color: 'rgba(69,254,201,0.8)', fontFamily: 'var(--font-mono)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-secondary)' }} />
          v2.4.0 ACTIVE
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all')}
              style={{
                background: active ? 'rgba(195,245,255,0.08)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'rgba(226,226,232,0.5)',
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && (
                <span className="ml-auto w-1 h-4 rounded-full" style={{ background: 'var(--color-primary)' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-colors"
          style={{ background: 'rgba(255,180,171,0.12)', color: 'var(--color-error)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,180,171,0.22)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,180,171,0.12)')}
        >
          <Zap className="w-3.5 h-3.5" />
          DEPLOY EMERGENCY
        </button>
        <div className="flex gap-2 px-1">
          <button className="flex items-center gap-1.5 text-[11px] transition-colors" style={{ color: 'rgba(226,226,232,0.3)' }}>
            <HelpCircle className="w-3 h-3" /> Support
          </button>
          <button className="flex items-center gap-1.5 text-[11px] transition-colors ml-auto" style={{ color: 'rgba(226,226,232,0.3)' }}>
            <Archive className="w-3 h-3" /> Archive
          </button>
        </div>
      </div>
    </aside>
  )
}
