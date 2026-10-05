import type { Media } from '../payload-types'
import { SITE_URL } from './format'
import type { Img } from './types'

/** Payload gives full URLs; images on our own domain are served as local paths so they can be optimised. */
const localise = (url: string): string => (url.startsWith(SITE_URL) ? url.slice(SITE_URL.length) || '/' : url)

/** Turn an upload field value into a plain image, or null when nothing is uploaded yet. */
export function toImg(value: unknown, fallbackAlt = ''): Img | null {
  if (!value || typeof value !== 'object') return null
  const m = value as Media
  if (!m.url) return null
  return { url: localise(m.url), alt: m.alt || fallbackAlt, width: m.width ?? 1200, height: m.height ?? 1500 }
}

export function toImgs(values: unknown, fallbackAlt = ''): Img[] {
  if (!Array.isArray(values)) return []
  return values.map((v) => toImg(v, fallbackAlt)).filter((x): x is Img => !!x)
}
