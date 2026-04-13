'use client'
import { useState } from 'react'
import { useDownLinks } from '@/hooks/useDownLinks'
import { useOutages } from '@/hooks/useOutages'
import { LogConsole } from '@/components/dashboard/LogConsole'

type Level = 'ALL' | 'CRITICAL' | 'ALERT' | 'UPDATE' | 'LOG' | 'INFO'
const LEVELS: Level[] = ['ALL', 'CRITICAL', 'ALERT', 'UPDATE', 'LOG', 'INFO']

export default function LogsPage() {
  const { links } = useDownLinks()
  const { records } = useOutages()
  const [level, setLevel] = useState<Level>('ALL')
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>
          System Logs
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="outline-none text-xs px-3 py-1.5 rounded w-48"
            style={{
              background: 'rgba(40,42,46,0.8)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--color-on-surface)',
            }}
          />
          <div className="flex gap-1">
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className="text-[10px] font-semibold px-2 py-1 rounded transition-colors"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: level === l ? 'rgba(195,245,255,0.1)' : 'transparent',
                  color: level === l ? 'var(--color-primary)' : 'rgba(226,226,232,0.3)',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1" style={{ minHeight: 0 }}>
        <LogConsole links={links} outages={records} maxEntries={500} searchTerm={search} levelFilter={level} />
      </div>
    </div>
  )
}
