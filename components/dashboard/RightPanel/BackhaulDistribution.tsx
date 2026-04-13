import { GlassPanel } from '@/components/ui/GlassPanel'
import { BACKHAUL_PROVIDERS } from '@/data/mock-providers'

export function BackhaulDistribution() {
  return (
    <GlassPanel className="p-3">
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(226,226,232,0.4)' }}>
        Backhaul Distribution
      </p>
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {BACKHAUL_PROVIDERS.map(p => (
          <div
            key={p.name}
            style={{ width: `${p.percentage}%`, background: p.color, transition: 'width 1s ease' }}
          />
        ))}
      </div>
      <div className="flex gap-3 mt-2">
        {BACKHAUL_PROVIDERS.map(p => (
          <div key={p.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: p.color }} />
            <span className="text-[10px]" style={{ color: 'rgba(226,226,232,0.5)' }}>{p.name}</span>
            <span className="text-[10px] tabular-nums" style={{ color: 'rgba(226,226,232,0.7)', fontFamily: 'var(--font-mono)' }}>
              {p.percentage}%
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
