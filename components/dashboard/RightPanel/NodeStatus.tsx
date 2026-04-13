import { GlassPanel } from '@/components/ui/GlassPanel'
import { StatusDot } from '@/components/ui/StatusDot'

export function NodeStatus() {
  return (
    <GlassPanel className="p-3 flex items-center justify-between">
      <div>
        <p className="text-[10px] tracking-wider uppercase" style={{ color: 'rgba(226,226,232,0.3)' }}>Firebase Node</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-on-surface)' }}>asia-southeast1</p>
        <p className="text-[10px]" style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)' }}>SGP · Singapore</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: 'var(--color-secondary)' }}>
          <StatusDot color="green" size={6} /> ACTIVE
        </span>
        <span className="text-[9px]" style={{ color: 'rgba(226,226,232,0.3)', fontFamily: 'var(--font-mono)' }}>
          RTDB · REST/SSE
        </span>
      </div>
    </GlassPanel>
  )
}
