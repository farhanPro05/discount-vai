import type { Metadata } from 'next'

import { DEFAULT_404_LINKS, NotFoundBody } from '../../../components/content/NotFoundBody'
import { getNav } from '../../../lib/catalog'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: true } }

export default async function NotFound() {
  const nav = await getNav().catch(() => [])
  const first = nav.find((t) => !t.soon && t.children.length)
  const links = first
    ? [
        { label: first.label, href: first.href },
        ...first.children.filter((c) => !c.soon).slice(-1).map((c) => ({ label: c.label, href: c.href })),
        ...nav.filter((t) => !t.soon && t.id !== first.id).flatMap((t) => (t.children[0] ? [{ label: t.children[0].label.replace(/\s*\(.*\)/, ''), href: t.children[0].href }] : [])),
        { label: 'New Arrivals', href: '/new-arrivals' },
        { label: 'Sale', href: '/sale' },
      ]
    : DEFAULT_404_LINKS
  return <NotFoundBody links={links} />
}
