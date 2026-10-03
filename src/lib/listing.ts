import { SORTS, type ListFilters, type SortKey } from './sorts'

export type SearchParams = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
const list = (v: string | string[] | undefined): string[] =>
  one(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12)
const num = (v: string | string[] | undefined): number | undefined => {
  const n = Number(one(v))
  return one(v) !== '' && Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined
}

export type ListingState = {
  sizes: string[]
  colours: string[]
  min?: number
  max?: number
  sale: boolean
  sort: SortKey
  page: number
  q: string
}

/** Read filters, sort and page from the URL (e.g. ?size=M,L&colour=White&sort=price-asc&page=2). */
export function parseListing(sp: SearchParams, defaultSort: SortKey = 'newest'): ListingState {
  const sort = one(sp.sort) as SortKey
  return {
    sizes: list(sp.size),
    colours: list(sp.colour),
    min: num(sp.min),
    max: num(sp.max),
    sale: one(sp.sale) === '1',
    sort: sort in SORTS ? sort : defaultSort,
    page: Math.max(1, num(sp.page) ?? 1),
    q: one(sp.q).trim().slice(0, 80),
  }
}

export function toFilters(s: ListingState, base: ListFilters): ListFilters {
  return {
    ...base,
    sizes: s.sizes,
    colours: s.colours,
    min: s.min,
    max: s.max,
    onSale: base.onSale || s.sale || undefined,
    q: base.q ?? (s.q || undefined),
  }
}

/** Build a URL for the same listing with some params changed (page resets unless given). */
export function listingHref(path: string, s: ListingState, change: Partial<ListingState>, defaultSort: SortKey = 'newest'): string {
  const n = { ...s, page: 1, ...change }
  const [bare, existing] = path.split('?')
  const p = new URLSearchParams(existing ?? '')
  for (const k of ['q', 'size', 'colour', 'min', 'max', 'sale', 'sort', 'page']) p.delete(k)
  path = bare
  if (n.q) p.set('q', n.q)
  if (n.sizes.length) p.set('size', n.sizes.join(','))
  if (n.colours.length) p.set('colour', n.colours.join(','))
  if (n.min != null) p.set('min', String(n.min))
  if (n.max != null) p.set('max', String(n.max))
  if (n.sale) p.set('sale', '1')
  if (n.sort !== defaultSort) p.set('sort', n.sort)
  if (n.page > 1) p.set('page', String(n.page))
  const qs = p.toString()
  return qs ? `${path}?${qs}` : path
}

export const hasFilters = (s: ListingState): boolean => !!(s.sizes.length || s.colours.length || s.min != null || s.max != null || s.sale)
