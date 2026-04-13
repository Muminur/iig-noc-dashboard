'use client'
import { useFirebaseSSE } from './useFirebaseSSE'

export interface OutageRecord {
  downAtISO: string
  upAtISO?: string
  linkLabel: string
  rawLinkName?: string
  interface?: string
  sourceNode?: string
  isBackhaul?: boolean
  backhaulProvider?: string
  priorityClass?: number
  downAt?: number
  emailSent?: boolean
  upEmailSent?: boolean
  clientName?: string
  bandwidth?: string
  clientBandwidth?: string
  circuitId?: string
  routePath?: string
}

export function useOutages() {
  const { data, loading, error } = useFirebaseSSE<Record<string, OutageRecord>>('outages')
  const records = data ? Object.values(data) : []
  return { records, loading, error }
}
