import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { cache } from 'react'

import { CategoryComingSoon } from '../../../../components/content/ComingSoon'
import { InfoLayout } from '../../../../components/content/InfoLayout'
import { PageBlocks } from '../../../../components/content/PageBlocks'
import { ListingView } from '../../../../components/listing/ListingView'
import type { ShapeKey } from '../../../../fields/shapes'
import { categoryIdsFor, getCategory } from '../../../../lib/catalog'
import { toImg } from '../../../../lib/media'
import { getClient } from '../../../../lib/payload'
import { findRedirect } from '../../../../lib/redirects'
import { snippet } from '../../../../lib/seo'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

const getPage = cache(async (slug: string) => {
  const payload = await getClient()
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 2 })
  return res.docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const found = await getCategory(slug)
  if (found) {
    const c = found.category
    const soon = c.status === 'soon'
    const heading = c.heading || c.name
    return {
      title: c.seo?.title || (soon ? `${heading}: coming soon` : `${heading} Online in Bangladesh`),
      description:
        c.seo?.description ||
        snippet(soon ? c.soonText : `${c.intro ?? ''} Cash on Delivery across Bangladesh and easy 7-day exchange.`) ||
        undefined,
      alternates: { canonical: `/${slug}` },
      robots: soon ? { index: false, follow: true } : undefined,
      openGraph: { images: toImg(c.seo?.image) ? [toImg(c.seo?.image)!.url] : undefined },
    }
  }
  const page = await getPage(slug)
  if (page) {
    return {
      title: page.seo?.title || page.title,
      description: page.seo?.description || snippet(page.lead) || undefined,
      alternates: { canonical: `/${slug}` },
    }
  }
  return {}
}

export default async function SlugPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const found = await getCategory(slug)

  if (found) {
    const { category: c, children } = found
    if (c.status === 'soon') {
      return (
        <CategoryComingSoon
          name={c.name}
          slug={c.slug ?? slug}
          heading={c.soonHeading}
          text={c.soonText}
          image={toImg(c.soonImage, c.name)}
          shape={(c.shape as ShapeKey) ?? null}
        />
      )
    }
    const path = `/${c.slug}`
    return (
      <ListingView
        path={path}
        title={c.heading || c.name}
        crumbs={[{ label: 'Home', href: '/' }]}
        here={c.name}
        intro={c.intro}
        introMore={c.introMore}
        chips={
          children.length
            ? [{ label: `All ${c.name}`, href: path, on: true }, ...children.map((k) => ({ label: k.name, href: `${path}/${k.slug}` }))]
            : undefined
        }
        base={{ categoryIds: categoryIdsFor(c, children) }}
        searchParams={sp}
        faqTitle={c.faqTitle}
        faqs={c.faqs}
        emptyName={c.name.toLowerCase()}
        fallback={{ label: 'Back to home', href: '/' }}
      />
    )
  }

  const page = await getPage(slug)
  if (page) {
    return (
      <InfoLayout current={`/${slug}`} crumb={page.navLabel || page.title}>
        <h1>{page.title}</h1>
        {page.lead ? <p className="lead">{page.lead}</p> : null}
        <PageBlocks blocks={page.layout} />
      </InfoLayout>
    )
  }

  const to = await findRedirect(`/${slug}`)
  if (to) permanentRedirect(to)
  notFound()
}
