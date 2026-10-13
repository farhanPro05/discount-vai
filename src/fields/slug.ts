import type { Field, FieldHook, TextFieldSingleValidation } from 'payload'

export const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const fillFrom =
  (source: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return toSlug(value)
    // Not sent at all (e.g. a scheduled publish only changes the status): keep the current address.
    if (value === undefined && typeof originalDoc?.slug === 'string' && originalDoc.slug) return originalDoc.slug
    const from = data?.[source] ?? originalDoc?.[source]
    return typeof from === 'string' ? toSlug(from) : value
  }

/** Addresses the site already uses for its own pages: a category or page with one of these could never be reached. */
export const RESERVED_SLUGS = [
  'account', 'admin', 'api', 'cart', 'checkout', 'contact', 'faq', 'invoice', 'new-arrivals', 'order', 'payment',
  'products', 'robots.txt', 'sale', 'search', 'sitemap.xml', 'size-guide', 'style-guide', 'track-order', 'favicon.ico',
]

/**
 * Categories and pages share the top-level address space (/men, /about): refuse the site's own
 * addresses, and a page that would hide behind a top-level category with the same slug (or the reverse).
 */
const topLevelSlug =
  (collection: 'categories' | 'pages'): TextFieldSingleValidation =>
  async (value, { req, id, data }) => {
    if (!value) return true
    const isTopLevel = collection === 'pages' || !(data as { parent?: unknown })?.parent
    if (!isTopLevel) return true
    if (RESERVED_SLUGS.includes(value)) return `"${value}" is already used by the shop's own ${value} page. Choose another address.`
    const other = collection === 'pages' ? 'categories' : 'pages'
    const clash = await req.payload.find({
      collection: other,
      where: { and: [{ slug: { equals: value } }, ...(other === 'categories' ? [{ parent: { exists: false } }] : [])] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (clash.docs.some((d) => d.id !== id)) return `A ${other === 'pages' ? 'page' : 'top-level category'} already uses "/${value}". Choose another address.`
    return true
  }

/** URL slug that fills itself from another field (usually the name) when left empty. */
export const slugField = (source = 'name', topLevel?: 'categories' | 'pages'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  label: 'URL slug',
  admin: {
    position: 'sidebar',
    description: 'Part of the web address. Filled in from the name if left empty. Changing it later sets up a redirect automatically.',
  },
  hooks: { beforeValidate: [fillFrom(source)] },
  ...(topLevel ? { validate: topLevelSlug(topLevel) } : {}),
})
