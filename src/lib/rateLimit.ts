import { headers } from 'next/headers'

/*
 * A small in-memory rate limit for the public forms (orders, codes, sign-ups, messages, logins), so a
 * script can't flood them, guess codes or hold the shop's stock with fake orders. Counts live in this
 * server process, which is fine for the single-instance setup (see the build plan, Deployment).
 */

const STORE = Symbol.for('discount-vai.rate-limits')
type Store = Map<string, number[]>

function store(): Store {
  const g = globalThis as { [STORE]?: Store }
  g[STORE] ??= new Map()
  return g[STORE]
}

/**
 * The visitor's IP. Cloudflare's header first, then the reverse proxy's X-Real-IP, then the last
 * X-Forwarded-For entry (the one our proxy added; earlier entries can be faked by the client).
 */
export async function clientIp(): Promise<string> {
  const h = await headers()
  const forwarded = (h.get('x-forwarded-for') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  return h.get('cf-connecting-ip') || h.get('x-real-ip') || forwarded[forwarded.length - 1] || 'unknown'
}

/** Record one use of `key`; false if it was already used `max` times within `windowMs`. */
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const s = store()
  const hits = (s.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= max) {
    s.set(key, hits)
    return false
  }
  hits.push(now)
  s.set(key, hits)
  // Forget old visitors now and then so the map can't grow without limit.
  if (s.size > 20_000) for (const [k, v] of s) if (!v.some((t) => now - t < 3_600_000)) s.delete(k)
  return true
}

const MIN = 60_000

/** Limits per visitor (IP) for each public action. */
export const LIMITS = {
  order: { max: 10, windowMs: 60 * MIN },
  payment: { max: 20, windowMs: 60 * MIN },
  code: { max: 60, windowMs: 10 * MIN },
  subscribe: { max: 10, windowMs: 60 * MIN },
  message: { max: 5, windowMs: 60 * MIN },
  login: { max: 20, windowMs: 15 * MIN },
  register: { max: 10, windowMs: 60 * MIN },
  reset: { max: 5, windowMs: 60 * MIN },
  track: { max: 20, windowMs: 60 * MIN },
} as const

export const TOO_MANY = 'Too many tries in a short time. Please wait a few minutes and try again.'

/** true if this visitor has used `action` too often recently (and counts this attempt). */
export async function tooMany(action: keyof typeof LIMITS): Promise<boolean> {
  const { max, windowMs } = LIMITS[action]
  return !allow(`${action}:${await clientIp()}`, max, windowMs)
}
