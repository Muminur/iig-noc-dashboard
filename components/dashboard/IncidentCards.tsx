'use client'
import { WifiOff, Network, Clock } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import type { ParsedLink } from '@/lib/link-parser'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function incidentId(raw: string): string {
  let h = 0
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) >>> 0
  return `INC-${(h % 90000 + 10000).toString()}`
}

function IncidentCard({ link, accent }: { link: ParsedLink; accent: 'red' | 'orange' }) {
  const isRed = accent === 'red'
  const accentColor = isRed ? 'var(--color-error)' : 'var(--color-tertiary)'
  return (
    <GlassPanel
      className="flex-1 p-4 min-w-0"
      style={{ borderLeft: `2px solid ${accentColor}60` }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}20` }}
        >
          {isRed
            ? <WifiOff className="w-4 h-4" style={{ color: accentColor }} />
            : <Network className="w-4 h-4" style={{ color: accentColor }} />
          }
        </div>
        <SeverityBadge severity={link.severity} />
      </div>

      <p className="text-[10px] mb-1" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)' }}>
        {incidentId(link.raw)}
      </p>
      <p
        className="text-sm font-semibold leading-tight mb-2 truncate"
        style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}
        title={link.client}
      >
        {link.client}
      </p>

      <div className="space-y-1 text-[11px]" style={{ color: 'rgba(226,226,232,0.5)' }}>
        <div className="flex gap-1">
          <span style={{ color: 'rgba(226,226,232,0.3)' }}>Node</span>
          <span className="ml-auto tabular-nums" style={{ color: 'rgba(226,226,232,0.7)', fontFamily: 'var(--font-mono)' }}>
            {link.node}
          </span>
        </div>
        <div className="flex gap-1">
          <span style={{ color: 'rgba(226,226,232,0.3)' }}>Interface</span>
          <span
            className="ml-auto tabular-nums truncate max-w-[130px]"
            style={{ color: 'rgba(226,226,232,0.7)', fontFamily: 'var(--font-mono)' }}
            title={link.interface}
          >
            {link.interface}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <Clock className="w-3 h-3" style={{ color: 'rgba(226,226,232,0.3)' }} />
          <span style={{ color: 'rgba(226,226,232,0.4)' }}>{timeAgo(link.downAtISO)}</span>
          <span className="ml-auto text-[10px] tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
            {isNaN(new Date(link.downAtISO).getTime()) ? '—' : new Date(link.downAtISO).toLocaleDateString()}
          </span>
        </div>
      </div>
    </GlassPanel>
  )
}

export function IncidentCards({ links }: { links: ParsedLink[] }) {
  const [first, second] = links.slice(0, 2)
  return (
    <div className="flex gap-4">
      {first && <IncidentCard link={first} accent="red" />}
      {second && <IncidentCard link={second} accent="orange" />}
      {!first && (
        <GlassPanel className="flex-1 p-4 flex items-center justify-center text-sm" style={{ color: 'rgba(226,226,232,0.3)' }}>
          No active incidents
        </GlassPanel>
      )}
    </div>
  )
}
