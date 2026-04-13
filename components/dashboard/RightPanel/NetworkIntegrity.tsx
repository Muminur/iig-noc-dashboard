'use client'
import { useEffect, useState } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { GlassPanel } from '@/components/ui/GlassPanel'

const TOTAL_LINKS = 50

export function NetworkIntegrity({ downCount }: { downCount: number }) {
  const uptime = Math.max(0, Math.round(((TOTAL_LINKS - downCount) / TOTAL_LINKS) * 1000) / 10)
  const [latency, setLatency] = useState('28.0')
  useEffect(() => {
    const update = () => setLatency((28 + Math.sin(Date.now() / 10000) * 2).toFixed(1))
    update()
    const id = setInterval(update, 3000)
    return () => clearInterval(id)
  }, [])
  const gaugeData = [{ name: 'uptime', value: uptime, fill: 'var(--color-secondary)' }]

  return (
    <GlassPanel className="p-3">
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(226,226,232,0.4)' }}>
        Network Integrity
      </p>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="65%" outerRadius="90%"
              startAngle={225} endAngle={-45}
              data={gaugeData}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={4}
                background={{ fill: 'rgba(255,255,255,0.05)' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 flex-1">
          <div>
            <p className="text-[10px]" style={{ color: 'rgba(226,226,232,0.3)' }}>Core Uptime</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-display)' }}>
              {uptime}%
            </p>
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'rgba(226,226,232,0.3)' }}>Latency</p>
            <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
              {latency} ms
            </p>
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'rgba(226,226,232,0.3)' }}>Down Links</p>
            <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-error)', fontFamily: 'var(--font-display)' }}>
              {downCount}
            </p>
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
