'use client'
import { useEffect, useRef, useState } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import type { ParsedLink } from '@/lib/link-parser'
import type { OutageRecord } from '@/hooks/useOutages'

type LogLevel = 'CRITICAL' | 'ALERT' | 'UPDATE' | 'LOG' | 'INFO'

export interface LogEntry {
  id: string
  ts: string
  level: LogLevel
  message: string
  source: string
}

function safeTime(ts: string): string {
  const d = new Date(ts)
  return isNaN(d.getTime()) ? '--:--:--' : d.toISOString().slice(11, 19)
}

const levelColor: Record<LogLevel, string> = {
  CRITICAL: 'var(--color-error)',
  ALERT:    'var(--color-amber)',
  UPDATE:   'var(--color-primary)',
  LOG:      'var(--color-secondary)',
  INFO:     'rgba(226,226,232,0.4)',
}

export function linkToLog(link: ParsedLink): LogEntry {
  return {
    id: `dl-${link.raw}`,
    ts: link.downAtISO,
    level: link.severity === 'CRITICAL' ? 'CRITICAL' : 'ALERT',
    message: `LINK DOWN: ${link.client} — ${link.interface}`,
    source: link.node,
  }
}

export function outageToLog(o: OutageRecord, idx: number): LogEntry {
  return {
    id: `out-${idx}-${o.downAtISO}`,
    ts: o.downAtISO,
    level: o.upAtISO ? 'LOG' : 'UPDATE',
    message: o.upAtISO ? `RESTORED: ${o.linkLabel}` : `OUTAGE RECORDED: ${o.linkLabel}`,
    source: 'OUTAGE_DB',
  }
}

interface Props {
  links: ParsedLink[]
  outages: OutageRecord[]
  maxEntries?: number
  searchTerm?: string
  levelFilter?: LogLevel | 'ALL'
}

export function LogConsole({ links, outages, maxEntries = 200, searchTerm = '', levelFilter = 'ALL' }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [userScrolled, setUserScrolled] = useState(false)

  const entries: LogEntry[] = [
    ...links.map(linkToLog),
    ...outages.map(outageToLog),
  ]
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
    .filter(e => levelFilter === 'ALL' || e.level === levelFilter)
    .filter(e => !searchTerm || e.message.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(-maxEntries)

  useEffect(() => {
    if (!userScrolled) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length, userScrolled])

  return (
    <GlassPanel
      className="overflow-hidden"
      innerClassName="flex flex-col h-full"
      style={{ height: '100%' }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <span
          className="text-[10px] font-semibold tracking-widest"
          style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)' }}
        >
          LIVE LOG CONSOLE
        </span>
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] tabular-nums"
            style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}
          >
            {entries.length} ENTRIES
          </span>
          <button
            onClick={() => setUserScrolled(s => !s)}
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded transition-colors tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              background: userScrolled ? 'rgba(251,191,36,0.1)' : 'rgba(69,254,201,0.08)',
              color: userScrolled ? 'var(--color-amber)' : 'var(--color-secondary)',
            }}
          >
            {userScrolled ? '‖ PAUSED' : '▼ AUTO'}
          </button>
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1 min-h-0"
        style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
        onScroll={e => {
          const el = e.currentTarget
          setUserScrolled(el.scrollTop + el.clientHeight < el.scrollHeight - 20)
        }}
      >
        {entries.map(entry => (
          <div key={entry.id} className="flex gap-3 leading-5">
            <span className="shrink-0 tabular-nums" style={{ color: 'rgba(226,226,232,0.25)' }}>
              {safeTime(entry.ts)}
            </span>
            <span className="w-16 shrink-0 font-semibold tabular-nums" style={{ color: levelColor[entry.level] }}>
              [{entry.level.slice(0, 4)}]
            </span>
            <span className="shrink-0 hidden md:block" style={{ color: 'rgba(226,226,232,0.3)' }}>{entry.source}</span>
            <span className="truncate" style={{ color: 'rgba(226,226,232,0.7)' }}>{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </GlassPanel>
  )
}
