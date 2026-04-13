'use client'
import { useDownLinks } from '@/hooks/useDownLinks'
import { useOutages } from '@/hooks/useOutages'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { BackhaulDistribution } from '@/components/dashboard/RightPanel/BackhaulDistribution'

const PROVIDER_COLORS: Record<string, { bg: string; text: string }> = {
  SMW5: { bg: 'rgba(195,245,255,0.15)', text: 'var(--color-primary)' },
  BTCL: { bg: 'rgba(251,191,36,0.15)', text: 'var(--color-amber)' },
}

function ProviderBadge({ provider }: { provider?: string }) {
  const label = provider ?? 'UNKNOWN'
  const style = PROVIDER_COLORS[label] ?? { bg: 'rgba(226,226,232,0.08)', text: 'rgba(226,226,232,0.5)' }
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-semibold tabular-nums tracking-wider uppercase"
      style={{ background: style.bg, color: style.text, fontFamily: 'var(--font-mono)' }}
    >
      {label}
    </span>
  )
}

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toISOString().slice(0, 16).replace('T', ' ')
}

export default function BackhaulPage() {
  const { links, loading: linksLoading } = useDownLinks()
  const { records, loading: outagesLoading } = useOutages()

  const isLoading = linksLoading || outagesLoading

  const backhaulOutages = records
    .filter(r => r.isBackhaul === true && !r.upAtISO)
    .sort((a, b) => (a.backhaulProvider ?? '').localeCompare(b.backhaulProvider ?? ''))

  const backhaulLinks = links.filter(l => l.type === 'IPBW' || l.type === 'UPSTREAM')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span
          className="tabular-nums text-sm"
          style={{ color: 'rgba(226,226,232,0.35)', fontFamily: 'var(--font-mono)' }}
        >
          Connecting to Firebase RTDB...
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1
        className="text-xl font-bold"
        style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}
      >
        Backhaul Links
      </h1>

      <div className="w-72">
        <BackhaulDistribution />
      </div>

      {/* Section 1 — Active Outages (outage-sourced, isBackhaul=true) */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-display)' }}
        >
          Backhaul Links — Active Outages
        </h2>
        <GlassPanel className="overflow-hidden">
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Link Label', 'Source Node', 'Interface', 'Provider', 'Circuit ID', 'Route', 'Down Since'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-semibold tracking-wider uppercase"
                    style={{ color: 'rgba(226,226,232,0.3)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backhaulOutages.map((r, i) => (
                <tr
                  key={`${r.linkLabel}-${i}`}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td
                    className="px-4 py-2.5 tabular-nums font-medium"
                    style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-mono)' }}
                  >
                    {r.linkLabel}
                  </td>
                  <td
                    className="px-4 py-2.5 tabular-nums"
                    style={{ color: 'rgba(226,226,232,0.7)', fontFamily: 'var(--font-mono)' }}
                  >
                    {r.sourceNode ?? '—'}
                  </td>
                  <td
                    className="px-4 py-2.5 truncate max-w-[160px] tabular-nums"
                    style={{ color: 'rgba(226,226,232,0.6)', fontFamily: 'var(--font-mono)' }}
                  >
                    {r.interface ?? '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <ProviderBadge provider={r.backhaulProvider} />
                  </td>
                  <td
                    className="px-4 py-2.5 tabular-nums"
                    style={{ color: 'rgba(226,226,232,0.5)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
                  >
                    {r.circuitId ?? '—'}
                  </td>
                  <td
                    className="px-4 py-2.5"
                    style={{ color: 'rgba(226,226,232,0.6)' }}
                  >
                    {r.routePath ?? '—'}
                  </td>
                  <td
                    className="px-4 py-2.5 tabular-nums"
                    style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
                  >
                    {fmtDate(r.downAtISO)}
                  </td>
                </tr>
              ))}
              {backhaulOutages.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center"
                    style={{ color: 'rgba(226,226,232,0.3)' }}
                  >
                    No active backhaul outages
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassPanel>
      </div>

      {/* Section 2 — IPBW / Upstream links (liveStatus-sourced) */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-display)' }}
        >
          IPBW / Upstream Links
        </h2>
        <GlassPanel className="overflow-hidden">
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Node', 'Client', 'Interface', 'Type', 'BW In', 'BW Out', 'Severity', 'Down Since'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-semibold tracking-wider uppercase"
                    style={{ color: 'rgba(226,226,232,0.3)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backhaulLinks.map(link => (
                <tr
                  key={link.raw}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td
                    className="px-4 py-2.5 tabular-nums"
                    style={{ color: 'rgba(226,226,232,0.7)', fontFamily: 'var(--font-mono)' }}
                  >
                    {link.node}
                  </td>
                  <td
                    className="px-4 py-2.5 max-w-[160px] truncate"
                    style={{ color: 'rgba(226,226,232,0.8)' }}
                  >
                    {link.client}
                  </td>
                  <td
                    className="px-4 py-2.5 truncate max-w-[140px] tabular-nums"
                    style={{ color: 'rgba(226,226,232,0.6)', fontFamily: 'var(--font-mono)' }}
                  >
                    {link.interface}
                  </td>
                  <td
                    className="px-4 py-2.5 tabular-nums"
                    style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}
                  >
                    {link.type}
                  </td>
                  <td
                    className="px-4 py-2.5 tabular-nums"
                    style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}
                  >
                    {link.bandwidth.in}
                  </td>
                  <td
                    className="px-4 py-2.5 tabular-nums"
                    style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}
                  >
                    {link.bandwidth.out}
                  </td>
                  <td className="px-4 py-2.5">
                    <SeverityBadge severity={link.severity} />
                  </td>
                  <td
                    className="px-4 py-2.5 tabular-nums"
                    style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
                  >
                    {fmtDate(link.downAtISO)}
                  </td>
                </tr>
              ))}
              {backhaulLinks.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center"
                    style={{ color: 'rgba(226,226,232,0.3)' }}
                  >
                    No IPBW / upstream links down
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassPanel>
      </div>
    </div>
  )
}
