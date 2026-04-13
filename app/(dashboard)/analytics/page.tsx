'use client'
import { useEffect, useState } from 'react'
import { useLiveStatus } from '@/hooks/useLiveStatus'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DataPoint { time: string; downCount: number }

export default function AnalyticsPage() {
  const { downCount } = useLiveStatus()
  const [history, setHistory] = useState<DataPoint[]>([])

  useEffect(() => {
    setHistory(prev => {
      const next = [...prev, {
        time: new Date().toISOString().slice(11, 19),
        downCount,
      }]
      return next.slice(-60)
    })
  }, [downCount])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>
        Analytics
      </h1>
      <GlassPanel className="p-4">
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'rgba(226,226,232,0.4)' }}>
          Down Link Count — Session History
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-high)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: 'var(--color-on-surface)',
              }}
            />
            <Line type="monotone" dataKey="downCount" stroke="var(--color-error)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </GlassPanel>
    </div>
  )
}
