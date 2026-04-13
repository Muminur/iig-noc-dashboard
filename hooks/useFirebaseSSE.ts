'use client'
import { useEffect, useState } from 'react'
import { sseUrl } from '@/lib/firebase-rest'

export function useFirebaseSSE<T>(path: string): {
  data: T | null
  loading: boolean
  error: string | null
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = sseUrl(path)
    const es = new EventSource(url)

    es.addEventListener('put', (e: MessageEvent) => {
      try {
        const payload: { path: string; data: T } = JSON.parse(e.data)
        if (payload.path === '/') {
          setData(payload.data)
        } else {
          const key = payload.path.replace(/^\//, '')
          setData(prev =>
            prev && typeof prev === 'object'
              ? { ...prev, [key]: payload.data }
              : payload.data
          )
        }
        setLoading(false)
        setError(null)
      } catch {
        setError('Parse error')
      }
    })

    es.addEventListener('patch', (e: MessageEvent) => {
      try {
        const payload: { path: string; data: Partial<T> } = JSON.parse(e.data)
        setData(prev =>
          prev && typeof prev === 'object'
            ? { ...prev, ...(payload.data as object) }
            : payload.data as T
        )
        setLoading(false)
      } catch {
        setError('Parse error')
      }
    })

    es.onerror = () => setError('Reconnecting...')

    return () => es.close()
  }, [path])

  return { data, loading, error }
}
