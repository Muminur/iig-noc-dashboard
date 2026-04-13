'use client'
import { useDownLinks } from '@/hooks/useDownLinks'
import { useLiveStatus } from '@/hooks/useLiveStatus'
import { IncidentCards } from '@/components/dashboard/IncidentCards'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { NodeStatus } from '@/components/dashboard/RightPanel/NodeStatus'
import { NetworkMap } from '@/components/dashboard/RightPanel/NetworkMap'
import { NetworkIntegrity } from '@/components/dashboard/RightPanel/NetworkIntegrity'
import { StatusDot } from '@/components/ui/StatusDot'
import type { ParsedLink } from '@/lib/link-parser'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const STAT_TILES = [
  { key: 'critical' as const, label: 'CRITICAL',   color: 'var(--color-error)',      bg: 'rgba(255,100,100,0.08)',  border: 'rgba(255,100,100,0.4)'  },
  { key: 'high'     as const, label: 'HIGH',        color: 'var(--color-amber)',      bg: 'rgba(255,180,0,0.08)',   border: 'rgba(255,180,0,0.4)'    },
  { key: 'medium'   as const, label: 'MEDIUM',      color: 'var(--color-primary)',    bg: 'rgba(0,218,243,0.08)',   border: 'rgba(0,218,243,0.3)'    },
  { key: 'total'    as const, label: 'TOTAL DOWN',  color: 'var(--color-on-surface)', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.1)'  },
]

function IncidentTable({ links }: { links: ParsedLink[] }) {
  if (links.length === 0) {
    return (
      <GlassPanel className="flex-1 flex items-center justify-center py-8">
        <span className="text-sm" style={{ color: 'rgba(226,226,232,0.3)' }}>No active incidents</span>
      </GlassPanel>
    )
  }
  return (
    <GlassPanel
      className="overflow-hidden flex-1 min-h-0"
      innerClassName="flex flex-col h-full"
    >
      <div
        className="px-4 py-2 shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span
          className="text-[10px] font-semibold tracking-widest"
          style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)' }}
        >
          ALL ACTIVE INCIDENTS
        </span>
        <span
          className="text-[10px] tabular-nums"
          style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}
        >
          {links.length} DOWN
        </span>
      </div>
      <div className="overflow-y-auto flex-1 min-h-0">
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Severity', 'Client', 'Node', 'Interface', 'Down Since'].map(h => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-semibold tracking-wider uppercase"
                  style={{ color: 'rgba(226,226,232,0.3)', fontSize: 10 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {links.map(link => (
              <tr key={link.raw} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-2.5">
                  <SeverityBadge severity={link.severity} />
                </td>
                <td
                  className="px-4 py-2.5 max-w-[180px] truncate"
                  style={{ color: 'var(--color-on-surface)' }}
                  title={link.client}
                >
                  {link.client}
                </td>
                <td
                  className="px-4 py-2.5 tabular-nums"
                  style={{ color: 'rgba(226,226,232,0.6)', fontFamily: 'var(--font-mono)' }}
                >
                  {link.node}
                </td>
                <td
                  className="px-4 py-2.5 max-w-[160px] truncate tabular-nums"
                  style={{ color: 'rgba(226,226,232,0.5)', fontFamily: 'var(--font-mono)' }}
                  title={link.interface}
                >
                  {link.interface}
                </td>
                <td
                  className="px-4 py-2.5 tabular-nums"
                  style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)' }}
                >
                  {timeAgo(link.downAtISO)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassPanel>
  )
}

export default function IncidentsPage() {
  const { links, loading } = useDownLinks()
  const { downCount } = useLiveStatus()

  const counts = {
    critical: links.filter(l => l.severity === 'CRITICAL').length,
    high:     links.filter(l => l.severity === 'HIGH').length,
    medium:   links.filter(l => l.severity === 'MEDIUM').length,
    total:    links.length,
  }

  return (
    <div className="flex gap-5 h-full min-h-0">
      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <StatusDot color="green" size={6} />
              <span
                className="text-[10px] tracking-widest"
                style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}
              >
                LIVE SYSTEMS TELEMETRY · IIG BSCPLC
              </span>
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}
            >
              INCIDENT MONITOR
            </h1>
          </div>
          <div className="text-right">
            <p
              className="text-[10px]"
              style={{ color: 'rgba(226,226,232,0.3)', fontFamily: 'var(--font-mono)' }}
            >
              BSCPLC IIG NOC
            </p>
            <p
              className="text-[10px] font-semibold tabular-nums"
              style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}
            >
              {downCount} DOWN
            </p>
          </div>
        </div>

        {loading ? (
          <div
            className="flex-1 flex items-center justify-center text-sm animate-pulse"
            style={{ color: 'rgba(226,226,232,0.3)', fontFamily: 'var(--font-mono)' }}
          >
            Connecting to Firebase RTDB...
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            {/* Stat bar */}
            <div className="flex gap-3">
              {STAT_TILES.map(t => (
                <GlassPanel
                  key={t.key}
                  className="flex-1 p-4"
                  style={{ borderLeft: `2px solid ${t.border}`, background: t.bg }}
                >
                  <p
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: t.color, fontFamily: 'var(--font-display)' }}
                  >
                    {counts[t.key]}
                  </p>
                  <p
                    className="text-[10px] font-semibold tracking-widest mt-1"
                    style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)' }}
                  >
                    {t.label}
                  </p>
                </GlassPanel>
              ))}
            </div>

            <IncidentCards links={links} />
            <IncidentTable links={links} />
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="w-[260px] shrink-0 flex flex-col gap-4">
        <NodeStatus />
        <NetworkMap links={links} />
        <NetworkIntegrity downCount={downCount} />
      </div>
    </div>
  )
}
