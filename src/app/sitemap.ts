import type { MetadataRoute } from 'next'

import { categoryHref, getAllCategories } from '../lib/catalog'
import { SITE_URL } from '../lib/format'
import { getClient } from '../lib/payload'

export const dynamic = 'force-dynamic'

/** sitemap.xml, always up to date with the admin: live categories, published products and pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getClient()
  const [cats, products, pages] = await Promise.all([
    getAllCategories(),
    payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      limit: 5000,
      depth: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({ collection: 'pages', limit: 200, depth: 0, pagination: false, select: { slug: true, updatedAt: true } }),
  ])
  const live = cats.filter((c) => {
    if (c.status !== 'live') return false
    const pid = c.parent ? (typeof c.parent === 'object' ? c.parent.id : c.parent) : null
    const parent = pid ? cats.find((x) => x.id === pid) : null
    return !parent || parent.status !== 'hidden'
  })
  const url = (path: string) => `${SITE_URL}${path}`
  return [
    { url: url('/'), changeFrequency: 'daily', priority: 1 },
    { url: url('/new-arrivals'), changeFrequency: 'daily', priority: 0.8 },
    { url: url('/sale'), changeFrequency: 'daily', priority: 0.8 },
    ...live.map((c) => ({ url: url(categoryHref(c, cats)), lastModified: c.updatedAt, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...products.docs.map((p) => ({ url: url(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...pages.docs.map((p) => ({ url: url(`/${p.slug}`), lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.4 })),
    { url: url('/faq'), changeFrequency: 'monthly', priority: 0.4 },
    { url: url('/size-guide'), changeFrequency: 'monthly', priority: 0.4 },
    { url: url('/contact'), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
