import type { Product } from '../payload-types'
import { absoluteUrl, SITE_URL } from './format'
import { toImgs } from './media'
import type { CardProduct } from './types'

type Json = Record<string, unknown>

export function organizationLd(site: { facebook?: string | null; instagram?: string | null; tiktok?: string | null; phone?: string | null; email?: string | null }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${SITE_URL}/#org`,
    name: 'Discount Vai',
    url: SITE_URL,
    logo: absoluteUrl('/icon-512.png'),
    areaServed: 'BD',
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash on Delivery, bKash, Nagad, Visa, Mastercard',
    sameAs: [site.facebook, site.instagram, site.tiktok].filter(Boolean),
    ...(site.email ? { email: site.email } : {}),
  }
}

export function websiteLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Discount Vai',
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#org` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  }
}

export function itemListLd(cards: CardProduct[], name: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: cards.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(c.href), name: c.name })),
  }
}

export function faqLd(qas: { question: string; answer: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qas.map((q) => ({ '@type': 'Question', name: q.question, acceptedAnswer: { '@type': 'Answer', text: q.answer } })),
  }
}

export function productLd(p: Product, exchangeDays = 7): Json {
  const images = (p.colours ?? []).flatMap((c) => toImgs(c.images)).slice(0, 6).map((i) => absoluteUrl(i.url))
  const price = p.onSale && p.salePrice ? p.salePrice : p.price
  const url = absoluteUrl(`/products/${p.slug}`)
  const category = typeof p.category === 'object' && p.category ? p.category.name : undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.seo?.description || p.description || undefined,
    sku: p.details?.sku || undefined,
    image: images,
    brand: { '@type': 'Brand', name: 'Discount Vai' },
    category,
    color: (p.colours ?? []).map((c) => c.name).join(', ') || undefined,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'BDT',
      price: String(price),
      availability: (p.totalStock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#org` },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BD',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: exchangeDays,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'BD' },
      },
    },
  }
}

/** First sentence or ~155 characters, for meta descriptions. */
export function snippet(text?: string | null, max = 155): string | undefined {
  if (!text) return undefined
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}
