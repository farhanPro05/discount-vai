import type { CollectionAfterChangeHook, Payload } from 'payload'

type Slugged = { id: number; slug?: string | null; parent?: number | { id: number; slug?: string | null } | null }

/** Public path of a document, matching the storefront routes. */
export async function pathFor(
  collection: 'products' | 'categories' | 'pages',
  doc: Slugged,
  payload: Payload,
): Promise<string | null> {
  if (!doc.slug) return null
  if (collection === 'products') return `/products/${doc.slug}`
  if (collection === 'pages') return `/${doc.slug}`
  if (!doc.parent) return `/${doc.slug}`
  const parent =
    typeof doc.parent === 'object'
      ? doc.parent
      : await payload.findByID({ collection: 'categories', id: doc.parent, depth: 0 }).catch(() => null)
  return parent?.slug ? `/${parent.slug}/${doc.slug}` : `/${doc.slug}`
}

/**
 * When a slug changes, keep the old web address working: add a redirect from the old path
 * to the document (the redirect follows the document if it moves again).
 */
export const redirectOnSlugChange =
  (collection: 'products' | 'categories' | 'pages'): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, operation, req }) => {
    if (operation !== 'update' || !previousDoc?.slug || previousDoc.slug === doc.slug) return doc
    if ((doc as { _status?: string })._status === 'draft') return doc
    const from = await pathFor(collection, previousDoc as Slugged, req.payload)
    if (!from) return doc
    const existing = await req.payload.find({ collection: 'redirects', where: { from: { equals: from } }, limit: 1, req })
    const data = { from, to: { type: 'reference' as const, reference: { relationTo: collection, value: doc.id } } }
    if (existing.docs[0]) await req.payload.update({ collection: 'redirects', id: existing.docs[0].id, data, req })
    else await req.payload.create({ collection: 'redirects', data, req })
    return doc
  }
