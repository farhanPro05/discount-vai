import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, Payload } from 'payload'

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

const liveKey = (id: number | string) => `liveSlug:${id}`

/**
 * For collections with drafts (products): before a publish, note the address that is live right now.
 * Payload's `previousDoc` is the latest version, which may be a draft that already carries the new
 * slug, so comparing with it would miss the change (draft saved first, published later).
 */
export const rememberLiveSlug: CollectionBeforeChangeHook = async ({ data, operation, originalDoc, req, context, collection }) => {
  if (operation !== 'update' || !originalDoc?.id || context?.stockUpdate || data?._status === 'draft') return data
  const live = await req.payload
    .findByID({ collection: collection.slug as 'products', id: originalDoc.id, depth: 0, draft: false, overrideAccess: true, req })
    .catch(() => null)
  // req.context, not the hook's `context` argument: the after-change hook doesn't always get the same object.
  req.context[liveKey(originalDoc.id)] = live && live._status === 'published' ? { slug: live.slug } : null
  return data
}

/**
 * When a slug changes, keep the old web address working: add a redirect from the old path
 * to the document (the redirect follows the document if it moves again).
 */
export const redirectOnSlugChange =
  (collection: 'products' | 'categories' | 'pages'): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, operation, req, context }) => {
    // Stock-only saves (orders) never change the address.
    if (context?.stockUpdate) return doc
    if (operation !== 'update' || (doc as { _status?: string })._status === 'draft') return doc
    // Drafts: compare with what was live before this publish (rememberLiveSlug), not the latest draft.
    const key = liveKey(doc.id)
    const before = key in req.context ? (req.context[key] as { slug?: string | null } | null) : previousDoc
    if (!before?.slug || before.slug === doc.slug) return doc
    const from = await pathFor(collection, { ...(previousDoc as Slugged), slug: before.slug }, req.payload)
    if (!from) return doc
    const existing = await req.payload.find({ collection: 'redirects', where: { from: { equals: from } }, limit: 1, req })
    const data = { from, to: { type: 'reference' as const, reference: { relationTo: collection, value: doc.id } } }
    if (existing.docs[0]) await req.payload.update({ collection: 'redirects', id: existing.docs[0].id, data, req })
    else await req.payload.create({ collection: 'redirects', data, req })
    return doc
  }
