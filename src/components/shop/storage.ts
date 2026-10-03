'use client'

import { useSyncExternalStore } from 'react'

/* Small helpers to read browser storage safely (empty on the server and in private mode). */

const noop = () => () => {}

/** true after the page has hydrated in the browser. */
export const useHydrated = (): boolean =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )

const read = (area: 'local' | 'session', key: string): string | null => {
  try {
    return (area === 'local' ? window.localStorage : window.sessionStorage).getItem(key)
  } catch {
    return null
  }
}

/** A storage value as a string ('' when missing). Updates when another tab changes it. */
export function useStoredString(key: string, area: 'local' | 'session' = 'local'): string {
  return useSyncExternalStore(
    (cb) => {
      const on = (e: StorageEvent) => e.key === key && cb()
      window.addEventListener('storage', on)
      return () => window.removeEventListener('storage', on)
    },
    () => read(area, key) ?? '',
    () => '',
  )
}

const parsed = new Map<string, { raw: string; value: unknown }>()

/** A JSON storage value (cached so React gets the same object until the stored text changes). */
export function useStoredJSON<T>(key: string, fallback: T, area: 'local' | 'session' = 'local'): T {
  const raw = useStoredString(key, area)
  if (!raw) return fallback
  const hit = parsed.get(key)
  if (hit && hit.raw === raw) return hit.value as T
  try {
    const value = JSON.parse(raw) as T
    parsed.set(key, { raw, value })
    return value
  } catch {
    return fallback
  }
}
