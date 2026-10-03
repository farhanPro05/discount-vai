import type { Where } from 'payload'
import { cache } from 'react'

import type { ShapeKey } from '../fields/shapes'
import type { Category, Product } from '../payload-types'
import { toImg, toImgs } from './media'
import { getClient } from './payload'
import { SORTS, type Facets, type ListFilters, type SortKey } from './sorts'
import type { CardProduct, NavCategory } from './types'

export { SORTS, type Facets, type ListFilters, type SortKey }

const PUBLISHED: Where = { _status: { equals: 'published' } }

/* ---------- Categories ---------- */

export const getAllCategories = cache(async (): Promise<Category[]> => {
  const payload = await getClient()
  const res = await payload.find({ collection: 'categories', limit: 300, depth: 1, sort: 'order', pagination: false })
  return res.docs
})

const parentOf = (c: Category): Category | null => (c.parent && typeof c.parent === 'object' ? c.parent : null)
const parentId = (c: Category): number | null =>
  c.parent ? (typeof c.parent === 'object' ? c.parent.id : c.parent) : null

/** Web address of a category: /men, /men/panjabi, /accessories/bags. */
export function categoryHref(c: Category, all?: Category[]): string {
  const pid = parentId(c)
  if (!pid) return `/${c.slug}`
  const parent = parentOf(c) ?? all?.find((x) => x.id === pid)
  return parent?.slug ? `/${parent.slug}/${c.slug}` : `/${c.slug}`
}

/** Menu tree: top-level categories (not hidden) with their visible children. */
export const getNav = cache(async (): Promise<NavCategory[]> => {
  const all = await getAllCategories()
  const visible = all.filter((c) => c.status !== 'hidden')
  return visible
    .filter((c) => !parentId(c))
    .map((top) => ({
      id: top.id,
      slug: top.slug ?? '',
      label: top.name,
      href: `/${top.slug}`,
      soon: top.status === 'soon',
      children: visible
        .filter((c) => parentId(c) === top.id)
        .map((c) => ({
          id: c.id,
          slug: c.slug ?? '',
          label: c.name,
          href: `/${top.slug}/${c.slug}`,
          soon: c.status === 'soon',
          group: c.menuGroup,
          tileText: c.tileText,
          shape: (c.shape as ShapeKey) ?? null,
          image: toImg(c.image, c.name),
        })),
    }))
})

/** Find a category by its path. `parentSlug` given → a subcategory. */
export async function getCategory(slug: string, parentSlug?: string): Promise<{ category: Category; parent: Category | null; children: Category[]; all: Category[] } | null> {
  const all = await getAllCategories()
  const category = all.find((c) => {
    if (c.slug !== slug || c.status === 'hidden') return false
    const pid = parentId(c)
    if (!parentSlug) return !pid
    const p = all.find((x) => x.id === pid)
    return p?.slug === parentSlug && p.status !== 'hidden'
  })
  if (!category) return null
  const pid = parentId(category)
  const parent = pid ? (all.find((x) => x.id === pid) ?? null) : null
  const children = all.filter((c) => parentId(c) === category.id && c.status !== 'hidden')
  return { category, parent, children, all }
}

/** A category plus all of its live subcategories (for listing a top-level category). */
export function categoryIdsFor(category: Category, children: Category[]): number[] {
  return [category.id, ...children.filter((c) => c.status === 'live').map((c) => c.id)]
}

/* ---------- Product cards ---------- */

export function toCard(p: Product): CardProduct {
  const category = typeof p.category === 'object' && p.category ? p.category.name : ''
  const onSale = !!p.onSale && !!p.salePrice
  return {
    id: p.id,
    slug: p.slug ?? String(p.id),
    href: `/products/${p.slug}`,
    name: p.name,
    category,
    colours: (p.colours ?? []).map((c) => ({
      name: c.name,
      hex: c.hex,
      images: toImgs(c.images, `${p.name} in ${c.name}`).slice(0, 3),
    })),
    price: onSale ? (p.salePrice as number) : p.price,
    was: p.price,
    onSale,
    discount: onSale ? (p.discountPercent ?? Math.round((1 - (p.salePrice as number) / p.price) * 100)) : 0,
    isNew: !!p.isNew,
    out: (p.totalStock ?? 0) <= 0,
    shape: (p.shape as ShapeKey) ?? 'tee',
  }
}

/* ---------- Listing ---------- */


function searchWhere(q: string): Where[] {
  return q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
    .slice(0, 5)
    .map(
      (term): Where => ({
        or: [
          { name: { like: term } } as Where,
          { searchTerms: { like: term } } as Where,
          { 'category.name': { like: term } } as Where,
          { colourNames: { contains: term } } as Where,
        ],
      }),
    )
}

export function buildWhere(f: ListFilters): Where {
  const and: Where[] = [PUBLISHED]
  if (f.categoryIds?.length) and.push({ category: { in: f.categoryIds } })
  if (f.onSale) and.push({ onSale: { equals: true } })
  if (f.isNew) and.push({ isNew: { equals: true } })
  if (f.sizes?.length) and.push({ availableSizes: { in: f.sizes } })
  if (f.colours?.length) and.push({ colourNames: { in: f.colours } })
  if (f.min != null) and.push({ effectivePrice: { greater_than_equal: f.min } })
  if (f.max != null) and.push({ effectivePrice: { less_than_equal: f.max } })
  if (f.q) and.push(...searchWhere(f.q))
  return { and }
}

export const PAGE_SIZE = 12

export async function listProducts(
  filters: ListFilters,
  sort: SortKey = 'newest',
  page = 1,
  limit = PAGE_SIZE,
): Promise<{ cards: CardProduct[]; total: number; page: number; totalPages: number }> {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'products',
    where: buildWhere(filters),
    sort: SORTS[sort]?.sort ?? SORTS.newest.sort,
    page,
    limit,
    depth: 1,
  })
  return { cards: res.docs.map(toCard), total: res.totalDocs, page: res.page ?? page, totalPages: res.totalPages }
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const sizeRank = (s: string) => {
  const i = SIZE_ORDER.indexOf(s)
  if (i >= 0) return i
  const n = Number(s)
  return Number.isFinite(n) ? 100 + n : 1000
}


/** Options for the filter menus, based on everything in this listing before filters. */
export async function getFacets(base: ListFilters): Promise<Facets> {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'products',
    where: buildWhere({ categoryIds: base.categoryIds, onSale: base.onSale, isNew: base.isNew, q: base.q }),
    limit: 500,
    depth: 0,
    pagination: false,
    select: { availableSizes: true, colours: { name: true, hex: true }, effectivePrice: true },
  })
  const sizes = new Set<string>()
  const colours = new Map<string, { name: string; hex: string; count: number }>()
  let min = Infinity
  let max = 0
  for (const p of res.docs) {
    for (const s of p.availableSizes ?? []) sizes.add(s)
    for (const c of p.colours ?? []) {
      const key = c.name
      const e = colours.get(key)
      if (e) e.count++
      else colours.set(key, { name: c.name, hex: c.hex, count: 1 })
    }
    const price = p.effectivePrice ?? 0
    if (price < min) min = price
    if (price > max) max = price
  }
  return {
    sizes: [...sizes].filter((s) => s !== 'One size').sort((a, b) => sizeRank(a) - sizeRank(b)),
    colours: [...colours.values()].sort((a, b) => b.count - a.count).slice(0, 18),
    min: Number.isFinite(min) ? Math.floor(min / 50) * 50 : 0,
    max: Math.ceil(max / 50) * 50,
  }
}

/* ---------- Single products ---------- */

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'products',
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
  })
  return res.docs[0] ?? null
})

export async function getCards(ids: (number | Product)[] | null | undefined): Promise<CardProduct[]> {
  const list = (ids ?? []).map((x) => (typeof x === 'object' ? x.id : x))
  if (!list.length) return []
  const payload = await getClient()
  const res = await payload.find({
    collection: 'products',
    where: { and: [PUBLISHED, { id: { in: list } }] },
    limit: list.length,
    depth: 1,
    pagination: false,
  })
  const byId = new Map(res.docs.map((d) => [d.id, d]))
  return list.map((id) => byId.get(id)).filter((d): d is Product => !!d).map(toCard)
}

export async function relatedProducts(product: Product, limit = 8): Promise<CardProduct[]> {
  const catId = typeof product.category === 'object' ? product.category.id : product.category
  const payload = await getClient()
  const res = await payload.find({
    collection: 'products',
    where: { and: [PUBLISHED, { category: { equals: catId } }, { id: { not_equals: product.id } }] },
    sort: '-salesCount',
    limit,
    depth: 1,
  })
  return res.docs.map(toCard)
}

/* ---------- Search suggestions ---------- */

export async function suggest(q: string): Promise<{ products: CardProduct[]; categories: { label: string; href: string; count: string }[]; total: number }> {
  const term = q.trim()
  const all = await getAllCategories()
  if (term.length < 2) return { products: [], categories: [], total: 0 }
  const { cards, total } = await listProducts({ q: term }, 'best', 1, 4)
  const low = term.toLowerCase()
  const categories = all
    .filter((c) => c.status !== 'hidden' && c.name.toLowerCase().includes(low))
    .slice(0, 3)
    .map((c) => {
      const parent = all.find((x) => x.id === parentId(c))
      return { label: parent ? `${parent.name} › ${c.name}` : c.name, href: categoryHref(c, all), count: c.status === 'soon' ? 'Soon' : 'Category' }
    })
  return { products: cards, categories, total }
}
