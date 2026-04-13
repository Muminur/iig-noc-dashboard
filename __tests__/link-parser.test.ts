import { parseLabel, deriveSeverity, parseBandwidth, parseDownLink } from '@/lib/link-parser'

describe('parseLabel', () => {
  it('parses standard IPT label', () => {
    const result = parseLabel('1-IPT-BSCPLC-DHK-CORE-03 - ADNGateway - Bundle-Ether655')
    expect(result).toEqual({
      priority: 1, type: 'IPT', node: 'BSCPLC-DHK-CORE-03',
      client: 'ADNGateway', iface: 'Bundle-Ether655',
    })
  })
  it('parses UPSTREAM label', () => {
    const result = parseLabel('1-UPSTREAM-BSCPLC-KKT-03-Orange-1ST-10G(KKT_MRS_10GLAN_0006)-TenGigE0_0_0_5')
    expect(result.type).toBe('UPSTREAM')
    expect(result.priority).toBe(1)
  })
  it('returns safe defaults for unrecognised format', () => {
    const result = parseLabel('weird-format')
    expect(result.priority).toBe(9)
    expect(result.type).toBe('UNKNOWN')
  })
})

describe('deriveSeverity', () => {
  it('priority 1 = CRITICAL', () => expect(deriveSeverity(1, 'IPT')).toBe('CRITICAL'))
  it('priority 2 = HIGH', () => expect(deriveSeverity(2, 'IPBW')).toBe('HIGH'))
  it('priority 4 = MEDIUM', () => expect(deriveSeverity(4, 'IPT')).toBe('MEDIUM'))
  it('UPSTREAM priority 2 elevates to CRITICAL', () => expect(deriveSeverity(2, 'UPSTREAM')).toBe('CRITICAL'))
  it('UPSTREAM priority 4 elevates to HIGH', () => expect(deriveSeverity(4, 'UPSTREAM')).toBe('HIGH'))
})

describe('parseBandwidth', () => {
  it('parses standard bandwidth string', () => {
    expect(parseBandwidth('In: 1.23K, Out: 20.90')).toEqual({ in: '1.23K', out: '20.90' })
  })
  it('returns zeros for empty string', () => {
    expect(parseBandwidth('')).toEqual({ in: '0', out: '0' })
  })
})

describe('parseDownLink', () => {
  it('returns a complete ParsedLink', () => {
    const raw = {
      bandwidth: 'In: 1.23K, Out: 20.90',
      clientName: 'test',
      downAtISO: '2026-04-12T23:15:42.515Z',
      linkLabel: 'test-label',
    }
    const result = parseDownLink('1-IPT-BSCPLC-DHK-CORE-03 - ADNGateway - Bundle-Ether655', raw)
    expect(result.severity).toBe('CRITICAL')
    expect(result.priority).toBe(1)
    expect(result.bandwidth).toEqual({ in: '1.23K', out: '20.90' })
    expect(result.node).toBe('BSCPLC-DHK-CORE-03')
    expect(result.client).toBe('ADNGateway')
    expect(result.interface).toBe('Bundle-Ether655')
  })
})
