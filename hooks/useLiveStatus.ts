'use client'
import { useFirebaseSSE } from './useFirebaseSSE'

interface LiveStatus {
  downCount: number
  systemStatus?: string
}

export function useLiveStatus() {
  const { data, loading, error } = useFirebaseSSE<LiveStatus>('liveStatus')
  return {
    downCount: data?.downCount ?? 0,
    systemStatus: data?.systemStatus ?? 'ACTIVE',
    loading,
    error,
  }
}
