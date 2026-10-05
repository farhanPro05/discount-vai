/* Listing filters and sort options. Safe to import in browser code (no database imports). */

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'best' | 'discount'

export const SORTS: Record<SortKey, { label: string; sort: string }> = {
  newest: { label: 'Newest', sort: '-createdAt' },
  'price-asc': { label: 'Price: low to high', sort: 'effectivePrice' },
  'price-desc': { label: 'Price: high to low', sort: '-effectivePrice' },
  best: { label: 'Best selling', sort: '-salesCount' },
  discount: { label: 'Biggest discount', sort: '-discountPercent' },
}

export type ListFilters = {
  categoryIds?: number[]
  onSale?: boolean
  isNew?: boolean
  sizes?: string[]
  colours?: string[]
  min?: number
  max?: number
  q?: string
}

export type Facets = { sizes: string[]; colours: { name: string; hex: string; count: number }[]; min: number; max: number }
