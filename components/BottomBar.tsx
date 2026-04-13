'use client'
import { StatusDot } from '@/components/ui/StatusDot'
import { useLiveStatus } from '@/hooks/useLiveStatus'

export function BottomBar() {
  const { downCount, systemStatus } = useLiveStatus()
  return (
    <div
      className="fixed bottom-0 right-0 h-10 flex items-center px-5 z-20"
      style={{
        left: '220px',
        backgroundColor: 'rgba(26,28,32,0.92)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <StatusDot color="cyan" size={6} />
        <span
          className="text-[11px] tracking-wider"
          style={{ color: 'rgba(226,226,232,0.5)', fontFamily: 'var(--font-mono)' }}
        >
          NOC MONITOR · {systemStatus}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}
        >
          {downCount}
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)' }}>
          ALERTS ACTIVE
        </span>
        <span
          className="ml-3 w-2 h-2 rounded-full animate-pulse"
          style={{ background: 'var(--color-error)' }}
        />
      </div>
    </div>
  )
}
