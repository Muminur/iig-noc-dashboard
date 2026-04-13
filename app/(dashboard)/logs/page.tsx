'use client'
import { useState } from 'react'
import { Download } from 'lucide-react'
import { useDownLinks } from '@/hooks/useDownLinks'
import { useOutages } from '@/hooks/useOutages'
import { LogConsole, linkToLog, outageToLog } from '@/components/dashboard/LogConsole'
import type { LogEntry } from '@/components/dashboard/LogConsole'

type Level = 'ALL' | 'CRITICAL' | 'ALERT' | 'UPDATE' | 'LOG' | 'INFO'
const LEVELS: Level[] = ['ALL', 'CRITICAL', 'ALERT', 'UPDATE', 'LOG', 'INFO']

const LEVEL_PILL: Record<Level, { activeColor: string; activeBg: string; activeBorder: string }> = {
  ALL:      { activeColor: 'rgba(226,226,232,0.8)',  activeBg: 'rgba(255,255,255,0.08)',  activeBorder: 'rgba(255,255,255,0.15)'   },
  CRITICAL: { activeColor: 'var(--color-error)',      activeBg: 'rgba(255,100,100,0.12)',  activeBorder: 'rgba(255,100,100,0.3)'    },
  ALERT:    { activeColor: 'var(--color-amber)',       activeBg: 'rgba(251,191,36,0.10)',   activeBorder: 'rgba(251,191,36,0.25)'    },
  UPDATE:   { activeColor: 'var(--color-primary)',     activeBg: 'rgba(195,245,255,0.08)',  activeBorder: 'rgba(195,245,255,0.2)'    },
  LOG:      { activeColor: 'var(--color-secondary)',   activeBg: 'rgba(69,254,201,0.08)',   activeBorder: 'rgba(69,254,201,0.2)'     },
  INFO:     { activeColor: 'rgba(226,226,232,0.5)',    activeBg: 'rgba(255,255,255,0.05)',  activeBorder: 'rgba(255,255,255,0.1)'    },
}

export default function LogsPage() {
  const { links } = useDownLinks()
  const { records } = useOutages()
  const [level, setLevel] = useState<Level>('ALL')
  const [search, setSearch] = useState('')

  function handleExport() {
    const entries: LogEntry[] = [
      ...links.map(linkToLog),
      ...records.map(outageToLog),
    ]
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .filter(e => level === 'ALL' || e.level === level)
      .filter(e => !search || e.message.toLowerCase().includes(search.toLowerCase()))

    const text = entries.map(e => {
      const d = new Date(e.ts)
      const time = isNaN(d.getTime()) ? '--:--:--' : d.toISOString().slice(11, 19)
      return `${time} [${e.level}] ${e.source} ${e.message}`
    }).join('\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `noc-log-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}
        >
          Event Log
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
            {LEVELS.map(l => {
              const active = level === l
              const pill = LEVEL_PILL[l]
              return (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: active ? pill.activeBg    : 'transparent',
                    color:      active ? pill.activeColor : 'rgba(226,226,232,0.3)',
                    border:     active ? `1px solid ${pill.activeBorder}` : '1px solid transparent',
                  }}
                >
                  {l}
                </button>
              )
            })}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded transition-colors"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'rgba(195,245,255,0.08)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(195,245,255,0.15)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(195,245,255,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(195,245,255,0.08)')}
          >
            <Download className="w-3 h-3" />
            EXPORT
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <LogConsole
          links={links}
          outages={records}
          maxEntries={500}
          searchTerm={search}
          levelFilter={level}
        />
      </div>
    </div>
  )
}
