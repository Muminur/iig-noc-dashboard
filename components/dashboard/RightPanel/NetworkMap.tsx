'use client'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error react-simple-maps has no type declarations
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { NETWORK_NODES } from '@/data/node-coordinates'
import type { ParsedLink } from '@/lib/link-parser'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const CONNECTIONS: [string, string][] = [
  ['DHK', 'SGP'], ['DHK', 'MRS'], ['COX', 'DHK'], ['KKT', 'DHK'],
]

function coords(id: string): [number, number] {
  const n = NETWORK_NODES.find(n => n.id === id)
  return n ? [n.lng, n.lat] : [0, 0]
}

export function NetworkMap({ links }: { links: ParsedLink[] }) {
  const downNodes = new Set(
    links.flatMap(l => {
      if (l.node.includes('DHK')) return ['DHK']
      if (l.node.includes('COX')) return ['COX']
      if (l.node.includes('KKT')) return ['KKT']
      return []
    })
  )

  return (
    <GlassPanel className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(226,226,232,0.4)' }}>
          KKT Node Cluster Map
        </span>
        <span className="text-[10px] tabular-nums" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>
          {NETWORK_NODES.length} NODES
        </span>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 80, center: [80, 20] }}
        style={{ width: '100%', height: '140px' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: { rsmKey: string }[] }) =>
            geographies.map((geo: { rsmKey: string }) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="rgba(255,255,255,0.04)"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={0.3}
                style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
              />
            ))
          }
        </Geographies>

        {CONNECTIONS.map(([from, to]) => (
          <Line
            key={`${from}-${to}`}
            from={coords(from)}
            to={coords(to)}
            stroke="rgba(0,218,243,0.3)"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        ))}

        {NETWORK_NODES.map(node => {
          const isDown = downNodes.has(node.id)
          return (
            <Marker key={node.id} coordinates={[node.lng, node.lat]}>
              <circle r={3} fill={isDown ? 'var(--color-error)' : 'var(--color-secondary)'} opacity={0.9} />
              <text y={-6} textAnchor="middle" style={{ fontSize: 5, fill: 'rgba(255,255,255,0.5)', userSelect: 'none' }}>
                {node.id}
              </text>
            </Marker>
          )
        })}
      </ComposableMap>

      <div className="mt-1 flex gap-3 text-[9px] tabular-nums" style={{ color: 'rgba(226,226,232,0.3)', fontFamily: 'var(--font-mono)' }}>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--color-secondary)' }} /> ONLINE
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--color-error)' }} /> DEGRADED
        </span>
        <span className="ml-auto">
          {NETWORK_NODES.filter(n => !downNodes.has(n.id)).length}/{NETWORK_NODES.length} ACTIVE
        </span>
      </div>
    </GlassPanel>
  )
}
