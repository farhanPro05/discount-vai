import { categoryHref, getAllCategories } from './catalog'
import { getClient } from './payload'

/** Where an old web address should now go (from the admin's Redirects list), or null. */
export async function findRedirect(path: string): Promise<string | null> {
  const payload = await getClient()
  const res = await payload.find({ collection: 'redirects', where: { from: { equals: path } }, limit: 1, depth: 1 })
  const r = res.docs[0]
  if (!r?.to) return null
  if (r.to.type === 'custom') return r.to.url || null
  const ref = r.to.reference
  if (!ref || typeof ref.value !== 'object') return null
  const doc = ref.value as { slug?: string | null; parent?: unknown }
  if (!doc.slug) return null
  if (ref.relationTo === 'products') return `/products/${doc.slug}`
  if (ref.relationTo === 'pages') return `/${doc.slug}`
  const all = await getAllCategories()
  const cat = all.find((c) => c.slug === doc.slug)
  return cat ? categoryHref(cat, all) : `/${doc.slug}`
}
