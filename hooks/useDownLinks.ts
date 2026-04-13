'use client'
import { useMemo } from 'react'
import { useFirebaseSSE } from './useFirebaseSSE'
import { parseDownLink, ParsedLink, RawDownLink } from '@/lib/link-parser'

export function useDownLinks() {
  const { data, loading, error } = useFirebaseSSE<Record<string, RawDownLink>>('downLinks')

  const links = useMemo<ParsedLink[]>(() => {
    if (!data) return []
    return Object.entries(data)
      .map(([key, val]) => parseDownLink(key, val))
      .sort((a, b) =>
        a.priority !== b.priority
          ? a.priority - b.priority
          : new Date(b.downAtISO).getTime() - new Date(a.downAtISO).getTime()
      )
  }, [data])

  return { links, loading, error }
}
