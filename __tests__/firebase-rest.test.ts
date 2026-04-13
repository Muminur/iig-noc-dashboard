import { restUrl, sseUrl, DB_URL } from '@/lib/firebase-rest'

describe('firebase-rest', () => {
  it('exports DB_URL constant', () => {
    expect(DB_URL).toBe('https://cactibscplc-default-rtdb.asia-southeast1.firebasedatabase.app')
  })
  it('builds REST URL with trailing .json', () => {
    expect(restUrl('downLinks')).toBe(`${DB_URL}/downLinks.json`)
  })
  it('strips leading slash from path', () => {
    expect(restUrl('/liveStatus')).toBe(`${DB_URL}/liveStatus.json`)
  })
  it('sseUrl returns same as restUrl', () => {
    expect(sseUrl('outages')).toBe(restUrl('outages'))
  })
})
