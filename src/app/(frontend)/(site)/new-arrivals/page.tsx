import type { Metadata } from 'next'

import { ListingView } from '../../../../components/listing/ListingView'

export const metadata: Metadata = {
  title: 'New Arrivals: Latest Men’s Clothing & Bags',
  description: 'The newest Panjabi, tees, trousers, jackets and bags at Discount Vai. New styles every week, Cash on Delivery across Bangladesh.',
  alternates: { canonical: '/new-arrivals' },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function NewArrivalsPage({ searchParams }: Props) {
  const sp = await searchParams
  return (
    <ListingView
      path="/new-arrivals"
      title="New Arrivals"
      crumbs={[{ label: 'Home', href: '/' }]}
      here="New Arrivals"
      intro="Fresh drops, newest first. New styles land every week."
      base={{ isNew: true }}
      searchParams={sp}
      emptyName="new arrivals"
      fallback={{ label: 'Shop Men', href: '/men' }}
    />
  )
}
