'use client'
import { useDownLinks } from '@/hooks/useDownLinks'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { BackhaulDistribution } from '@/components/dashboard/RightPanel/BackhaulDistribution'

export default function BackhaulPage() {
  const { links } = useDownLinks()
  const backhaulLinks = links.filter(l => l.type === 'IPBW' || l.type === 'UPSTREAM')

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>
        Backhaul Links
      </h1>
      <div className="w-72">
        <BackhaulDistribution />
      </div>
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
                <td className="px-4 py-2.5 tabular-nums" style={{ color: 'rgba(226,226,232,0.7)', fontFamily: 'var(--font-mono)' }}>{link.node}</td>
                <td className="px-4 py-2.5 max-w-[160px] truncate" style={{ color: 'rgba(226,226,232,0.8)' }}>{link.client}</td>
                <td className="px-4 py-2.5 truncate max-w-[140px] tabular-nums" style={{ color: 'rgba(226,226,232,0.6)', fontFamily: 'var(--font-mono)' }}>{link.interface}</td>
                <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{link.type}</td>
                <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>{link.bandwidth.in}</td>
                <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{link.bandwidth.out}</td>
                <td className="px-4 py-2.5"><SeverityBadge severity={link.severity} /></td>
                <td className="px-4 py-2.5 tabular-nums" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                  {(() => { const d = new Date(link.downAtISO); return isNaN(d.getTime()) ? '—' : d.toISOString().slice(0, 16).replace('T', ' ') })()}
                </td>
              </tr>
            ))}
            {backhaulLinks.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center" style={{ color: 'rgba(226,226,232,0.3)' }}>
                  No backhaul links down
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassPanel>
    </div>
  )
}
