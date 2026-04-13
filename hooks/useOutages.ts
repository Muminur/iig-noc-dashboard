'use client'
import { useFirebaseSSE } from './useFirebaseSSE'

export interface OutageRecord {
  downAtISO: string
  upAtISO?: string
  linkLabel: string
  duration?: number
  bandwidth?: string
}

export function useOutages() {
  const { data, loading, error } = useFirebaseSSE<Record<string, OutageRecord>>('outages')
  const records = data ? Object.values(data) : []
  return { records, loading, error }
}
