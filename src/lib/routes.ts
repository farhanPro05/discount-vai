import { notFound, permanentRedirect } from 'next/navigation'
import { cache } from 'react'

import { getCategory, getProduct } from './catalog'
import { getClient } from './payload'
import { findRedirect } from './redirects'

/** An info page (About, policies…) by its slug. */
export const getPage = cache(async (slug: string) => {
  const payload = await getClient()
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 2 })
  return res.docs[0] ?? null
})

/*
 * A page with a loading skeleton starts sending HTML straight away, and after that it can no longer answer
 * "404 Not Found" or "301 Moved" (Google would see a 200 instead). So these checks run in the route's layout,
 * before the skeleton: missing pages still return 404, and renamed ones a 301 to their new address.
 */
async function missing(path: string): Promise<never> {
  const to = await findRedirect(path)
  if (to) permanentRedirect(to)
  notFound()
}

export async function requireProduct(slug: string): Promise<void> {
  if (!(await getProduct(slug))) await missing(`/products/${slug}`)
}

export async function requireTopLevel(slug: string): Promise<void> {
  if (!(await getCategory(slug)) && !(await getPage(slug))) await missing(`/${slug}`)
}

export async function requireSubcategory(slug: string, sub: string): Promise<void> {
  if (!(await getCategory(sub, slug))?.parent) await missing(`/${slug}/${sub}`)
}
