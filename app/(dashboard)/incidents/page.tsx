'use client'
import { useDownLinks } from '@/hooks/useDownLinks'
import { useOutages } from '@/hooks/useOutages'
import { useLiveStatus } from '@/hooks/useLiveStatus'
import { IncidentCards } from '@/components/dashboard/IncidentCards'
import { LinkStatusCards } from '@/components/dashboard/LinkStatusCards'
import { LogConsole } from '@/components/dashboard/LogConsole'
import { NodeStatus } from '@/components/dashboard/RightPanel/NodeStatus'
import { NetworkMap } from '@/components/dashboard/RightPanel/NetworkMap'
import { NetworkIntegrity } from '@/components/dashboard/RightPanel/NetworkIntegrity'
import { BackhaulDistribution } from '@/components/dashboard/RightPanel/BackhaulDistribution'
import { StatusDot } from '@/components/ui/StatusDot'

export default function IncidentsPage() {
  const { links, loading } = useDownLinks()
  const { records } = useOutages()
  const { downCount } = useLiveStatus()

  return (
    <div className="flex gap-5 h-full min-h-0">
      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <StatusDot color="green" size={6} />
              <span
                className="text-[10px] tracking-widest"
                style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}
              >
                LIVE SYSTEMS TELEMETRY · IIG BSCPLC
              </span>
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}
            >
              INCIDENT MONITOR
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[10px]" style={{ color: 'rgba(226,226,232,0.3)', fontFamily: 'var(--font-mono)' }}>
              BSCPLC IIG NOC
            </p>
            <p
              className="text-[10px] font-semibold tabular-nums"
              style={{ color: 'var(--color-error)', fontFamily: 'var(--font-mono)' }}
            >
              {downCount} DOWN
            </p>
          </div>
        </div>

        {loading ? (
          <div
            className="flex-1 flex items-center justify-center text-sm animate-pulse"
            style={{ color: 'rgba(226,226,232,0.3)', fontFamily: 'var(--font-mono)' }}
          >
            Connecting to Firebase RTDB...
          </div>
        ) : (
          <>
            <IncidentCards links={links} />
            <LinkStatusCards links={links} />
            <LogConsole links={links} outages={records} />
          </>
        )}
      </div>

      {/* Right panel */}
      <div className="w-[260px] shrink-0 flex flex-col gap-4">
        <NodeStatus />
        <NetworkMap links={links} />
        <NetworkIntegrity downCount={downCount} />
        <BackhaulDistribution />
      </div>
    </div>
  )
}
