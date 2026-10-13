import type { Metadata } from 'next'
import Link from 'next/link'

import { CartView } from '../../../../components/shop/CartView'
import { listProducts } from '../../../../lib/catalog'
import { getCommerceInfo } from '../../../../lib/settings'

export const metadata: Metadata = { title: 'Your cart', robots: { index: false, follow: false } }

export default async function CartPage() {
  const [commerce, picks] = await Promise.all([getCommerceInfo(), listProducts({}, 'best', 1, 4)])
  return (
    <div className="wrap pg-pad">
      <nav className="bc" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="cur" aria-current="page">
          Cart
        </span>
      </nav>
      <CartView insideFee={commerce.inside.fee} freeOver={commerce.freeOver} picks={picks.cards} payLabels={commerce.payments.length ? commerce.payments : ['Cash on Delivery']} />
    </div>
  )
}
