'use client'
import { useEffect, useRef, useState } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import type { ParsedLink } from '@/lib/link-parser'
import type { OutageRecord } from '@/hooks/useOutages'

type LogLevel = 'CRITICAL' | 'ALERT' | 'UPDATE' | 'LOG' | 'INFO'

interface LogEntry {
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

function linkToLog(link: ParsedLink): LogEntry {
  return {
    id: `dl-${link.raw}`,
    ts: link.downAtISO,
    level: link.severity === 'CRITICAL' ? 'CRITICAL' : 'ALERT',
    message: `LINK DOWN: ${link.client} — ${link.interface}`,
    source: link.node,
  }
}

function outageToLog(o: OutageRecord, idx: number): LogEntry {
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
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, maxEntries)
    .filter(e => levelFilter === 'ALL' || e.level === levelFilter)
    .filter(e => !searchTerm || e.message.toLowerCase().includes(searchTerm.toLowerCase()))

  useEffect(() => {
    if (!userScrolled) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length, userScrolled])

  return (
    <GlassPanel className="flex flex-col" style={{ height: '260px' }}>
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span
          className="text-[10px] font-semibold tracking-widest"
          style={{ color: 'rgba(226,226,232,0.4)', fontFamily: 'var(--font-mono)' }}
        >
          LIVE LOG CONSOLE
        </span>
        <span
          className="text-[10px] tabular-nums"
          style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}
        >
          {entries.length} ENTRIES
        </span>
      </div>
      <div
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
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
