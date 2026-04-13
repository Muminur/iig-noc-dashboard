'use client'
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import type { ParsedLink } from '@/lib/link-parser'

function parseBwValue(s: string): number {
  const n = parseFloat(s)
  if (isNaN(n)) return 0
  if (s.includes('G')) return n * 1000
  if (s.includes('M')) return n
  if (s.includes('K')) return n / 1000
  return n
}

function LinkCard({ link }: { link: ParsedLink }) {
  const bwData = [
    { name: 'In',  value: parseBwValue(link.bandwidth.in) },
    { name: 'Out', value: parseBwValue(link.bandwidth.out) },
  ]
  return (
    <GlassPanel className="flex-1 p-4 min-w-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p
            className="text-xs font-semibold truncate max-w-[140px]"
            style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}
            title={link.interface}
          >
            {link.interface}
          </p>
          <p
            className="text-[10px] truncate max-w-[140px]"
            style={{ color: 'rgba(226,226,232,0.4)' }}
            title={link.node}
          >
            {link.node}
          </p>
        </div>
        <SeverityBadge severity={link.severity} />
      </div>

      <p
        className="text-[11px] truncate mb-3"
        style={{ color: 'rgba(226,226,232,0.5)' }}
        title={link.client}
      >
        {link.client}
      </p>

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
          <div className="flex justify-between">
            <span style={{ color: 'rgba(226,226,232,0.3)' }}>TX</span>
            <span style={{ color: 'var(--color-primary)' }}>{link.bandwidth.out}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'rgba(226,226,232,0.3)' }}>RX</span>
            <span style={{ color: 'var(--color-secondary)' }}>{link.bandwidth.in}</span>
          </div>
        </div>
        <div className="w-16 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bwData} barSize={8} barGap={4}>
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                <Cell fill="var(--color-primary)" />
                <Cell fill="var(--color-secondary)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassPanel>
  )
}

export function LinkStatusCards({ links }: { links: ParsedLink[] }) {
  const cards = links.slice(2, 5)
  return (
    <div>
      <p
        className="text-[11px] font-semibold tracking-widest uppercase mb-3"
        style={{ color: 'rgba(226,226,232,0.4)' }}
      >
        Specific Link Status
      </p>
      <div className="flex gap-4">
        {cards.map(link => <LinkCard key={link.raw} link={link} />)}
        {Array.from({ length: Math.max(0, 3 - cards.length) }).map((_, i) => (
          <GlassPanel
            key={i}
            className="flex-1 p-4 flex items-center justify-center text-xs"
            style={{ color: 'rgba(226,226,232,0.2)' }}
          >
            No data
          </GlassPanel>
        ))}
      </div>
    </div>
  )
}
