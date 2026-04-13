import { GlassPanel } from '@/components/ui/GlassPanel'
import { StatusDot } from '@/components/ui/StatusDot'
import { DB_URL } from '@/lib/firebase-rest'

const INFO = [
  { label: 'Dashboard Version', value: 'v2.4.0' },
  { label: 'Firebase Project',  value: 'cactibscplc' },
  { label: 'Database URL',      value: DB_URL },
  { label: 'DB Region',         value: 'asia-southeast1 (Singapore)' },
  { label: 'Data Transport',    value: 'REST SSE (EventSource)' },
  { label: 'Auth',              value: 'None — public read' },
  { label: 'Framework',         value: 'Next.js 16 App Router' },
  { label: 'Deployment',        value: 'Vercel' },
]

export default function SystemPage() {
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>
        System Info
      </h1>
      <GlassPanel>
        {INFO.map(({ label, value }, i) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: i < INFO.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
          >
            <span className="text-xs" style={{ color: 'rgba(226,226,232,0.4)' }}>{label}</span>
            <span
              className="text-xs text-right max-w-[240px] truncate"
              style={{ color: 'rgba(226,226,232,0.8)', fontFamily: 'var(--font-mono)' }}
            >
              {value}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs" style={{ color: 'rgba(226,226,232,0.4)' }}>System Status</span>
          <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--color-secondary)' }}>
            <StatusDot color="green" size={6} /> OPERATIONAL
          </span>
        </div>
      </GlassPanel>
    </div>
  )
}
