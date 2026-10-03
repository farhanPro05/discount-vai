import type { Metadata } from 'next'

import { ListingView } from '../../../../components/listing/ListingView'
import { getNav } from '../../../../lib/catalog'

export const metadata: Metadata = {
  title: 'Sale: Discounts on Men’s Clothing & Bags',
  description: 'Real discounts on Panjabi, trousers, shorts, jackets, tees and bags. Cash on Delivery across Bangladesh and easy 7-day exchange.',
  alternates: { canonical: '/sale' },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function SalePage({ searchParams }: Props) {
  const sp = await searchParams
  const nav = await getNav()
  const subs = nav.filter((t) => !t.soon).flatMap((t) => t.children.filter((c) => !c.soon))
  const chosen = typeof sp.c === 'string' ? subs.find((c) => c.slug === sp.c) : undefined
  return (
    <ListingView
      path={chosen ? `/sale?c=${chosen.slug}` : '/sale'}
      title="Sale"
      crumbs={[{ label: 'Home', href: '/' }]}
      here="Sale"
      intro="Real discounts on real stock. Prices shown are final."
      introMore=" Exchanges still apply on every sale item, and Cash on Delivery works as usual."
      chips={[
        { label: 'All sale', href: '/sale', on: !chosen },
        ...subs.map((c) => ({ label: c.label.replace(/\s*\(.*\)/, ''), href: `/sale?c=${c.slug}`, on: chosen?.id === c.id })),
      ]}
      base={{ onSale: true, categoryIds: chosen ? [chosen.id] : undefined }}
      searchParams={sp}
      defaultSort="discount"
      sorts={['discount', 'newest', 'price-asc', 'price-desc', 'best']}
      showSaleToggle={false}
      saleBanner={{ eyebrow: "Vai's Sale", heading: 'Up to 30% off', text: 'Real discounts on real stock, while it lasts.' }}
      emptyName="sale items"
      fallback={{ label: 'Shop new arrivals', href: '/new-arrivals' }}
    />
  )
}
