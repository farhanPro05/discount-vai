import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { CategoryComingSoon } from '../../../../../components/content/ComingSoon'
import { ListingView } from '../../../../../components/listing/ListingView'
import type { ShapeKey } from '../../../../../fields/shapes'
import { getCategory } from '../../../../../lib/catalog'
import { toImg } from '../../../../../lib/media'
import { findRedirect } from '../../../../../lib/redirects'
import { snippet } from '../../../../../lib/seo'

type Props = { params: Promise<{ slug: string; sub: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, sub } = await params
  const found = await getCategory(sub, slug)
  if (!found) return {}
  const c = found.category
  const soon = c.status === 'soon'
  const heading = c.heading || c.name
  const forWho = found.parent?.slug === 'men' ? ' for Men' : ''
  return {
    title: c.seo?.title || (soon ? `${heading}: coming soon` : `${heading}${forWho} Online in Bangladesh`),
    description:
      c.seo?.description || snippet(`${c.intro ?? ''} Cash on Delivery across Bangladesh and easy 7-day exchange.`) || undefined,
    alternates: { canonical: `/${slug}/${sub}` },
    robots: soon ? { index: false, follow: true } : undefined,
  }
}

export default async function SubcategoryPage({ params, searchParams }: Props) {
  const { slug, sub } = await params
  const sp = await searchParams
  const found = await getCategory(sub, slug)
  if (!found || !found.parent) {
    const to = await findRedirect(`/${slug}/${sub}`)
    if (to) permanentRedirect(to)
    notFound()
  }
  const { category: c, parent, all } = found
  if (c.status === 'soon') {
    return (
      <CategoryComingSoon
        name={c.name}
        slug={c.slug ?? sub}
        heading={c.soonHeading}
        text={c.soonText}
        image={toImg(c.soonImage, c.name)}
        shape={(c.shape as ShapeKey) ?? null}
      />
    )
  }
  const parentPath = `/${parent.slug}`
  const path = `${parentPath}/${c.slug}`
  const siblings = all.filter((x) => {
    const pid = x.parent ? (typeof x.parent === 'object' ? x.parent.id : x.parent) : null
    return pid === parent.id && x.status !== 'hidden'
  })
  return (
    <ListingView
      path={path}
      title={c.heading || c.name}
      crumbs={[
        { label: 'Home', href: '/' },
        { label: parent.name, href: parentPath },
      ]}
      here={c.name}
      intro={c.intro}
      introMore={c.introMore}
      chips={
        siblings.length > 1
          ? [{ label: `All ${parent.name}`, href: parentPath }, ...siblings.map((k) => ({ label: k.name, href: `${parentPath}/${k.slug}`, on: k.id === c.id }))]
          : undefined
      }
      base={{ categoryIds: [c.id] }}
      searchParams={sp}
      faqTitle={c.faqTitle}
      faqs={c.faqs}
      emptyName={c.name.replace(/\s*\(.*\)/, '')}
      fallback={{ label: `Shop all ${parent.name}`, href: parentPath }}
    />
  )
}
