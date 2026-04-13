export const DB_URL = 'https://cactibscplc-default-rtdb.asia-southeast1.firebasedatabase.app'

export function restUrl(path: string): string {
  const clean = path.replace(/^\//, '')
  return `${DB_URL}/${clean}.json`
}

export function sseUrl(path: string): string {
  return restUrl(path)
}
