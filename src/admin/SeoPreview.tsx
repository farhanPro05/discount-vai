'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

/*
 * "How it looks on Google", under the Search & sharing fields of products, categories and pages.
 * The automatic text mirrors what the website generates when the fields are left empty.
 */

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://discountvai.com').replace(/\/$/, '')
const BRAND = ' | Discount Vai'

const clip = (text: string, max = 155) => {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}
const taka = (n: number) => '৳' + Math.round(n).toLocaleString('en-US')
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0)

export const SeoPreview = () => {
  const { collectionSlug } = useDocumentInfo()
  const f = useFormFields(([fields]) => ({
    seoTitle: str(fields['seo.title']?.value),
    seoDescription: str(fields['seo.description']?.value),
    name: str(fields.name?.value),
    title: str(fields.title?.value),
    heading: str(fields.heading?.value),
    slug: str(fields.slug?.value),
    description: str(fields.description?.value),
    intro: str(fields.intro?.value),
    lead: str(fields.lead?.value),
    soonText: str(fields.soonText?.value),
    status: str(fields.status?.value),
    price: num(fields.price?.value),
    salePrice: num(fields.salePrice?.value),
    parent: fields.parent?.value as number | string | null | undefined,
  }))

  // A subcategory's address and title depend on its parent (e.g. /men/panjabi, "… for Men").
  const [parentSlug, setParentSlug] = useState<string | null>(null)
  useEffect(() => {
    if (collectionSlug !== 'categories' || !f.parent) return
    let live = true
    fetch(`/api/categories/${f.parent}?depth=0&draft=true`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => live && setParentSlug(d?.slug ?? null))
      .catch(() => null)
    return () => {
      live = false
    }
  }, [collectionSlug, f.parent])
  const parent = f.parent ? parentSlug : null

  let auto = { title: '', description: '', path: '' }
  let hidden = false
  if (collectionSlug === 'products') {
    const onSale = f.salePrice > 0 && f.salePrice < f.price
    const price = onSale ? f.salePrice : f.price
    auto = {
      title: f.name,
      description: clip(`${f.name} for ${taka(price)}${onSale ? ` (was ${taka(f.price)})` : ''}. ${f.description} Cash on Delivery across Bangladesh.`),
      path: `/products/${f.slug}`,
    }
  } else if (collectionSlug === 'categories') {
    const heading = f.heading || f.name
    const soon = f.status === 'soon'
    hidden = soon || f.status === 'hidden'
    auto = {
      title: soon ? `${heading}: coming soon` : `${heading}${parent === 'men' ? ' for Men' : ''} Online in Bangladesh`,
      description: clip(soon ? f.soonText : `${f.intro} Cash on Delivery across Bangladesh and easy 7-day exchange.`),
      path: parent ? `/${parent}/${f.slug}` : `/${f.slug}`,
    }
  } else if (collectionSlug === 'pages') {
    auto = { title: f.title, description: clip(f.lead), path: `/${f.slug}` }
  }

  const base = f.seoTitle || auto.title || 'Page title'
  // The site adds the brand to every title, except an info page whose own title already has it.
  const title = collectionSlug === 'pages' && !f.seoTitle && base.includes('Discount Vai') ? base : base + BRAND
  const description = f.seoDescription || auto.description
  const host = SITE.replace(/^https?:\/\//, '')
  const crumbs = [host, ...auto.path.split('/').filter(Boolean)].join(' › ')

  return (
    <div className="dv-serp">
      <p className="dv-serp-h">How it looks on Google</p>
      {hidden ? <p className="dv-serp-note">Hidden from Google while this category is Coming Soon or Hidden.</p> : null}
      <div className="dv-serp-card" aria-hidden="true">
        <span className="dv-serp-url">{crumbs}</span>
        <span className="dv-serp-title">{title.length > 62 ? `${title.slice(0, 60).trimEnd()}…` : title}</span>
        <span className="dv-serp-desc">{description || 'Add a description so Google shows your own words here.'}</span>
      </div>
      <p className="dv-serp-meta">
        {f.seoTitle ? 'Your title' : 'Automatic title'}: {title.length} characters{title.length > 60 ? ' (Google may cut it off after about 60)' : ''} ·{' '}
        {f.seoDescription ? 'your description' : 'automatic description'}: {description.length} characters
        {description.length > 160 ? ' (Google may cut it off after about 160)' : ''}
      </p>
    </div>
  )
}
