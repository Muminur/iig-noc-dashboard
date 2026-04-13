'use client'
import { useMemo } from 'react'
import { useFirebaseSSE } from './useFirebaseSSE'
import { parseDownLink, ParsedLink, RawDownLink } from '@/lib/link-parser'

interface LiveStatusWithLinks {
  downCount?: number
  lastUpdated?: string
  downLinks?: Record<string, RawDownLink>
}

export function useDownLinks() {
  const { data, loading, error } = useFirebaseSSE<LiveStatusWithLinks>('liveStatus')

  const links = useMemo<ParsedLink[]>(() => {
    if (!data?.downLinks) return []
    return Object.entries(data.downLinks)
      .map(([key, val]) => {
        const cleanKey = key.replace(/^'|'$/g, '')
        return parseDownLink(cleanKey, val)
      })
      .sort((a, b) =>
        a.priority !== b.priority
          ? a.priority - b.priority
          : new Date(b.downAtISO).getTime() - new Date(a.downAtISO).getTime()
      )
  }, [data])

  return { links, loading, error }
}
