/** Taka with thousands separators: 1450 → "৳1,450". */
export const taka = (n: number | null | undefined): string => '৳' + Math.round(Number(n) || 0).toLocaleString('en-US')

/** Values like "[01XXX-XXXXXX]" are placeholders from the mockups: show them, but never as links. */
export const isPlaceholder = (v?: string | null): boolean => !v || /^\[.*\]$/.test(v.trim())

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const absoluteUrl = (path: string): string => (path.startsWith('http') ? path : `${SITE_URL}${path}`)

/** WhatsApp chat link from the admin's number (digits only, with country code). */
export const waLink = (number?: string | null, text?: string): string | null => {
  const digits = (number ?? '').replace(/\D/g, '')
  if (digits.length < 10) return null
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export const formatDate = (iso: string | Date, withTime = false): string => {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit', hour12: true } : {}),
    timeZone: 'Asia/Dhaka',
  })
}

export const plural = (n: number, one: string, many = `${one}s`): string => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`
