'use client'
import { useDownLinks } from '@/hooks/useDownLinks'
import { useOutages } from '@/hooks/useOutages'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { BackhaulDistribution } from '@/components/dashboard/RightPanel/BackhaulDistribution'
import type { OutageRecord } from '@/hooks/useOutages'

const KNOWN_PROVIDERS = ['SMW4', 'SMW5'] as const
type KnownProvider = typeof KNOWN_PROVIDERS[number]

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toISOString().slice(0, 16).replace('T', ' ')
}

function ProviderBadge({ provider }: { provider?: string }) {
  const label = provider ?? 'UNKNOWN'
  const colors: Record<string, { bg: string; text: string }> = {
    SMW4: { bg: 'rgba(195,245,255,0.15)', text: 'var(--color-primary)'   },
    SMW5: { bg: 'rgba(69,254,201,0.15)',  text: 'var(--color-secondary)' },
  }
  const s = colors[label] ?? { bg: 'rgba(226,226,232,0.08)', text: 'rgba(226,226,232,0.5)' }
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-semibold tabular-nums tracking-wider uppercase"
      style={{ background: s.bg, color: s.text, fontFamily: 'var(--font-mono)' }}
    >
      {label}
    </span>
  )
}

function outageBorderColor(r: OutageRecord): string {
  if (r.priorityClass === 1) return 'var(--color-error)'
  if (r.priorityClass === 2) return 'var(--color-tertiary)'
  return 'var(--color-amber)'
}

const LINK_SEVERITY_BORDER: Record<string, string> = {
  CRITICAL: 'var(--color-error)',
  HIGH:     'var(--color-tertiary)',
  MEDIUM:   'var(--color-amber)',
  LOW:      'rgba(226,226,232,0.2)',
}

const PROVIDER_CARDS = [
  { name: 'SMW4',   color: 'var(--color-primary)',    accentBg: 'rgba(195,245,255,0.05)', accentBorder: 'rgba(195,245,255,0.25)' },
  { name: 'SMW5',   color: 'var(--color-secondary)',  accentBg: 'rgba(69,254,201,0.05)',  accentBorder: 'rgba(69,254,201,0.25)'  },
  { name: 'Others', color: 'rgba(226,226,232,0.5)',   accentBg: 'rgba(255,255,255,0.03)', accentBorder: 'rgba(255,255,255,0.1)'  },
]

export default function BackhaulPage() {
  const { links, loading: linksLoading } = useDownLinks()
  const { records, loading: outagesLoading } = useOutages()

  const isLoading = linksLoading || outagesLoading

  const backhaulOutages = records
    .filter(r => r.isBackhaul === true && !r.upAtISO)
    .sort((a, b) => (a.backhaulProvider ?? '').localeCompare(b.backhaulProvider ?? ''))

  const backhaulLinks = links.filter(l => l.type === 'IPBW' || l.type === 'UPSTREAM')

  const providerHasOutage = (name: string) =>
    name === 'Others'
      ? backhaulOutages.some(r => !KNOWN_PROVIDERS.includes(r.backhaulProvider as KnownProvider))
      : backhaulOutages.some(r => r.backhaulProvider === name)

  const providerOutageCount = (name: string) =>
    name === 'Others'
      ? backhaulOutages.filter(r => !KNOWN_PROVIDERS.includes(r.backhaulProvider as KnownProvider)).length
      : backhaulOutages.filter(r => r.backhaulProvider === name).length

  const providersUp = PROVIDER_CARDS.filter(p => !providerHasOutage(p.name)).length
  const downCircuits = backhaulOutages.length + backhaulLinks.length

  const STAT_TILES = [
    {
      label: 'ACTIVE OUTAGES',
      value: backhaulOutages.length,
      color:  backhaulOutages.length > 0 ? 'var(--color-error)'     : 'var(--color-secondary)',
      bg:     backhaulOutages.length > 0 ? 'rgba(255,100,100,0.08)' : 'rgba(69,254,201,0.05)',
      border: backhaulOutages.length > 0 ? 'rgba(255,100,100,0.4)'  : 'rgba(69,254,201,0.3)',
    },
    {
      label: 'IPBW LINKS DOWN',
      value: backhaulLinks.length,
      color:  backhaulLinks.length > 0 ? 'var(--color-amber)'     : 'var(--color-secondary)',
      bg:     backhaulLinks.length > 0 ? 'rgba(251,191,36,0.06)'  : 'rgba(69,254,201,0.05)',
      border: backhaulLinks.length > 0 ? 'rgba(251,191,36,0.3)'   : 'rgba(69,254,201,0.3)',
    },
    {
      label: 'PROVIDERS UP',
      value: providersUp,
      color:  'var(--color-secondary)',
      bg:     'rgba(69,254,201,0.05)',
      border: 'rgba(69,254,201,0.3)',
    },
    {
      label: 'DOWN CIRCUITS',
      value: downCircuits,
      color:  downCircuits > 0 ? 'var(--color-error)'     : 'var(--color-secondary)',
      bg:     downCircuits > 0 ? 'rgba(255,100,100,0.06)' : 'rgba(69,254,201,0.05)',
      border: downCircuits > 0 ? 'rgba(255,100,100,0.4)'  : 'rgba(69,254,201,0.3)',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="tabular-nums text-sm" style={{ color: 'rgba(226,226,232,0.35)', fontFamily: 'var(--font-mono)' }}>
          Connecting to Firebase RTDB...
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>
        Backhaul Links
      </h1>

      {/* Stat tiles */}
      <div className="flex gap-4">
        {STAT_TILES.map(t => (
          <GlassPanel
            key={t.label}
            className="flex-1 p-4"
            style={{ borderLeft: `2px solid ${t.border}`, background: t.bg }}
          >
            <p className="text-2xl font-bold tabular-nums" style={{ color: t.color, fontFamily: 'var(--font-display)' }}>
              {t.value}
            </p>
            <p className="text-[10px] font-semibold tracking-widest mt-1" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)' }}>
              {t.label}
            </p>
          </GlassPanel>
        ))}
      </div>

      {/* Two-column: provider panel + outage table */}
      <div className="flex gap-6">
        {/* Provider panel */}
        <div className="w-64 shrink-0 flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-display)' }}>
            Provider Status
          </h2>
          <div className="flex flex-col gap-2">
            {PROVIDER_CARDS.map(p => {
              const isDown = providerHasOutage(p.name)
              const count = providerOutageCount(p.name)
              return (
                <GlassPanel
                  key={p.name}
                  className="p-3"
                  style={{
                    borderLeft: `2px solid ${isDown ? 'var(--color-error)' : p.accentBorder}`,
                    background: p.accentBg,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-widest" style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
                      {p.name}
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color: isDown ? 'var(--color-error)' : 'var(--color-secondary)' }}>
                      {isDown ? 'DEGRADED' : 'ONLINE'}
                    </span>
                  </div>
                  {count > 0 && (
                    <p className="text-[10px] mt-1" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)' }}>
                      {count} active outage{count > 1 ? 's' : ''}
                    </p>
                  )}
                </GlassPanel>
              )
            })}
          </div>
          <BackhaulDistribution />
        </div>

        {/* Active outages table */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-display)' }}>
            Backhaul Links — Active Outages
          </h2>
          <GlassPanel className="overflow-hidden">
            <table className="w-full" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Link Label', 'Source Node', 'Interface', 'Provider', 'Circuit ID', 'Route', 'Down Since'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold tracking-wider uppercase" style={{ color: 'rgba(226,226,232,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {backhaulOutages.map((r, i) => (
                  <tr
                    key={`${r.linkLabel}-${i}`}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', borderLeft: `2px solid ${outageBorderColor(r)}60` }}
                  >
                    <td className="px-4 py-2.5 tabular-nums font-medium" style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-mono)' }}>{r.linkLabel}</td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'rgba(226,226,232,0.7)', fontFamily: 'var(--font-mono)' }}>{r.sourceNode ?? '—'}</td>
                    <td className="px-4 py-2.5 truncate max-w-[160px] tabular-nums" style={{ color: 'rgba(226,226,232,0.6)', fontFamily: 'var(--font-mono)' }}>{r.interface ?? '—'}</td>
                    <td className="px-4 py-2.5"><ProviderBadge provider={r.backhaulProvider} /></td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'rgba(226,226,232,0.5)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{r.circuitId ?? '—'}</td>
                    <td className="px-4 py-2.5" style={{ color: 'rgba(226,226,232,0.6)' }}>{r.routePath ?? '—'}</td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{fmtDate(r.downAtISO)}</td>
                  </tr>
                ))}
                {backhaulOutages.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'rgba(226,226,232,0.3)' }}>No active backhaul outages</td>
                  </tr>
                )}
              </tbody>
            </table>
          </GlassPanel>
        </div>
      </div>

      {/* IPBW / Upstream table */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-display)' }}>
          IPBW / Upstream Links
        </h2>
        <GlassPanel className="overflow-hidden">
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Node', 'Client', 'Interface', 'Type', 'BW In', 'BW Out', 'Severity', 'Down Since'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold tracking-wider uppercase" style={{ color: 'rgba(226,226,232,0.3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backhaulLinks.map(link => (
                <tr
                  key={link.raw}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', borderLeft: `2px solid ${LINK_SEVERITY_BORDER[link.severity] ?? 'transparent'}60` }}
                >
                  <td className="px-4 py-2.5 tabular-nums" style={{ color: 'rgba(226,226,232,0.7)', fontFamily: 'var(--font-mono)' }}>{link.node}</td>
                  <td className="px-4 py-2.5 max-w-[160px] truncate" style={{ color: 'rgba(226,226,232,0.8)' }}>{link.client}</td>
                  <td className="px-4 py-2.5 truncate max-w-[140px] tabular-nums" style={{ color: 'rgba(226,226,232,0.6)', fontFamily: 'var(--font-mono)' }}>{link.interface}</td>
                  <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{link.type}</td>
                  <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>{link.bandwidth.in}</td>
                  <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{link.bandwidth.out}</td>
                  <td className="px-4 py-2.5"><SeverityBadge severity={link.severity} /></td>
                  <td className="px-4 py-2.5 tabular-nums" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{fmtDate(link.downAtISO)}</td>
                </tr>
              ))}
              {backhaulLinks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center" style={{ color: 'rgba(226,226,232,0.3)' }}>No IPBW / upstream links down</td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassPanel>
      </div>
    </div>
  )
}
