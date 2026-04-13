export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface RawDownLink {
  bandwidth: string
  clientName: string
  downAtISO: string
  linkLabel: string
}

export interface ParsedLink {
  raw: string
  priority: number
  type: string
  node: string
  client: string
  interface: string
  severity: Severity
  bandwidth: { in: string; out: string }
  downAtISO: string
  linkLabel: string
}

export function parseLabel(key: string): {
  priority: number; type: string; node: string; client: string; iface: string
} {
  // Standard format: priority-TYPE-node - client - interface
  const match = key.match(/^(\d+)-([A-Z]+)-(.+?)\s+-\s+(.+?)\s+-\s+(.+)$/)
  if (match) {
    return {
      priority: parseInt(match[1], 10),
      type: match[2],
      node: match[3],
      client: match[4],
      iface: match[5].trim(),
    }
  }
  // Compact format (e.g. UPSTREAM): priority-TYPE-rest (no " - " separators)
  const simple = key.match(/^(\d+)-([A-Z]+)-(.+)$/)
  if (simple) {
    return {
      priority: parseInt(simple[1], 10),
      type: simple[2],
      node: simple[3],
      client: key,
      iface: key,
    }
  }
  return { priority: 9, type: 'UNKNOWN', node: key, client: key, iface: key }
}

export function deriveSeverity(priority: number, type: string): Severity {
  if (priority === 1) return 'CRITICAL'
  if (type === 'UPSTREAM') return priority === 2 ? 'CRITICAL' : 'HIGH'
  if (priority === 2) return 'HIGH'
  return 'MEDIUM'
}

export function parseBandwidth(raw: string): { in: string; out: string } {
  const match = raw.match(/In:\s*([^,]+),\s*Out:\s*(.+)/)
  if (!match) return { in: '0', out: '0' }
  return { in: match[1].trim(), out: match[2].trim() }
}

export function parseDownLink(key: string, value: RawDownLink): ParsedLink {
  const { priority, type, node, client, iface } = parseLabel(key)
  return {
    raw: key,
    priority,
    type,
    node,
    client,
    interface: iface,
    severity: deriveSeverity(priority, type),
    bandwidth: parseBandwidth(value.bandwidth ?? ''),
    downAtISO: value.downAtISO,
    linkLabel: value.linkLabel,
  }
}
