import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import { Carousel } from '../../../../../components/product/Carousel'
import { ProductDetail, RecentlyViewed, type PD } from '../../../../../components/product/ProductDetail'
import type { SizeGuideData } from '../../../../../components/product/SizeGuideModal'
import { JsonLd } from '../../../../../components/ui/JsonLd'
import type { ShapeKey } from '../../../../../fields/shapes'
import { categoryHref, getAllCategories, getProduct, relatedProducts, toCard } from '../../../../../lib/catalog'
import { absoluteUrl, taka } from '../../../../../lib/format'
import { toImg, toImgs } from '../../../../../lib/media'
import { findRedirect } from '../../../../../lib/redirects'
import { breadcrumbLd, productLd, snippet } from '../../../../../lib/seo'
import { getCommerceInfo } from '../../../../../lib/settings'
import type { Category, SizeGuide } from '../../../../../payload-types'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await getProduct(slug)
  if (!p) return {}
  const price = p.onSale && p.salePrice ? p.salePrice : p.price
  const image = toImg(p.seo?.image) ?? toImgs(p.colours?.[0]?.images)[0]
  const description =
    p.seo?.description ||
    snippet(`${p.name} for ${taka(price)}${p.onSale ? ` (was ${taka(p.price)})` : ''}. ${p.description ?? ''} Cash on Delivery across Bangladesh.`)
  return {
    title: p.seo?.title || p.name,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: {
      type: 'website',
      title: p.seo?.title || p.name,
      description,
      images: image ? [{ url: absoluteUrl(image.url), width: image.width, height: image.height, alt: image.alt }] : undefined,
    },
    other: { 'product:price:amount': String(price), 'product:price:currency': 'BDT' },
  }
}

function guideData(g: SizeGuide | number | null | undefined): SizeGuideData | null {
  if (!g || typeof g !== 'object') return null
  const columns = g.columns.split(',').map((s) => s.trim()).filter(Boolean)
  return {
    name: g.name,
    columns,
    rows: (g.rows ?? []).map((r) => ({ size: r.size, values: r.values.split(',').map((v) => Number(v.trim())) })),
    howToMeasure: (g.howToMeasure ?? []).map((m) => ({ label: m.label, text: m.text })),
    tip: g.tip,
  }
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const p = await getProduct(slug)
  if (!p) {
    const to = await findRedirect(`/products/${slug}`)
    if (to) permanentRedirect(to)
    notFound()
  }
  const [commerce, related, all] = await Promise.all([getCommerceInfo(), relatedProducts(p), getAllCategories()])
  const category = typeof p.category === 'object' ? (p.category as Category) : all.find((c) => c.id === p.category)
  const parentId = category?.parent ? (typeof category.parent === 'object' ? category.parent.id : category.parent) : null
  const parent = parentId ? all.find((c) => c.id === parentId) : null
  const card = toCard(p)
  const wanted = typeof sp.colour === 'string' ? sp.colour.toLowerCase() : ''
  const initialColour = Math.max(0, (p.colours ?? []).findIndex((c) => c.name.toLowerCase() === wanted))

  const details = [
    { label: 'Fabric', value: p.details?.fabric },
    { label: 'Fit', value: p.details?.fit },
    { label: 'Care', value: p.details?.care },
    { label: 'SKU', value: p.details?.sku },
  ].filter((d): d is { label: string; value: string } => !!d.value)

  const pd: PD = {
    id: p.id,
    slug: p.slug ?? slug,
    name: p.name,
    kicker: p.kicker,
    category: category?.name ?? '',
    price: card.price,
    was: card.was,
    onSale: card.onSale,
    discount: card.discount,
    isNew: card.isNew,
    shape: (p.shape as ShapeKey) ?? 'tee',
    colours: (p.colours ?? []).map((c) => ({
      name: c.name,
      hex: c.hex,
      images: toImgs(c.images, `${p.name} in ${c.name}`),
      sizes: (c.sizes ?? []).map((s) => ({ size: s.size, stock: s.stock ?? 0 })),
    })),
    description: p.description,
    details,
    guide: guideData(p.sizeGuide),
    initialColour,
    delivery: {
      insideFee: commerce.inside.fee,
      insideEta: commerce.inside.eta,
      outsideFee: commerce.outside.fee,
      outsideEta: commerce.outside.eta,
      freeOver: commerce.freeOver,
      exchangeDays: commerce.exchangeDays,
    },
    payments: commerce.payments.join(', ') || 'Cash on Delivery',
    shareUrl: absoluteUrl(`/products/${p.slug}`),
  }

  const crumbs = [
    { name: 'Home', path: '/' },
    ...(parent ? [{ name: parent.name, path: categoryHref(parent, all) }] : []),
    ...(category ? [{ name: category.name, path: categoryHref(category, all) }] : []),
    { name: p.name, path: `/products/${p.slug}` },
  ]

  return (
    <div className="wrap">
      <JsonLd data={[productLd(p, commerce.exchangeDays), breadcrumbLd(crumbs)]} />
      <nav className="bc" aria-label="Breadcrumb">
        {crumbs.slice(0, -1).map((c) => (
          <span key={c.path} style={{ display: 'contents' }}>
            <Link href={c.path}>{c.name}</Link>
            <span aria-hidden="true">/</span>
          </span>
        ))}
        <span className="cur" aria-current="page">
          {p.name}
        </span>
      </nav>
      <ProductDetail p={pd} card={card} />
      {related.length ? (
        <section className="sec" aria-label="You may also like">
          <Carousel title="You may also like" items={related} link={category ? categoryHref(category, all) : null} linkLabel={`More ${category?.name ?? ''}`.trim()} />
        </section>
      ) : null}
      <RecentlyViewed current={card.href} />
    </div>
  )
}
