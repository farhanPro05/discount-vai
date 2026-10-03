import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AccountShell } from '../../../../../../components/account/AccountShell'
import { OrderLines } from '../../../../../../components/shop/OrderBits'
import { OrderStatus } from '../../../../../../components/shop/OrderStatus'
import { waLink } from '../../../../../../lib/format'
import { getOrderForViewer } from '../../../../../../lib/orders'
import { getSite } from '../../../../../../lib/settings'

export const metadata: Metadata = { title: 'Order details', robots: { index: false, follow: false } }

type Props = { params: Promise<{ number: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { number } = await params
  return (
    <AccountShell current={`/account/orders/${number}`}>
      {async (customer) => {
        const [order, site] = await Promise.all([getOrderForViewer(number, null, customer.id), getSite()])
        if (!order) notFound()
        const chat = waLink(site.whatsapp, `Hi! About my order ${order.orderNumber}`)
        return (
          <>
            <Link className="lnk back" href="/account/orders" style={{ marginTop: 0 }}>
              ‹ All orders
            </Link>
            <OrderStatus order={order} />
            <div className="od-grid">
              <section className="box">
                <h2>Items</h2>
                <OrderLines order={order} totalLabel={order.paymentMethod === 'cod' ? 'Total to pay on delivery' : 'Total paid'} />
              </section>
              <section className="box">
                <h2>Delivery</h2>
                <p className="addr">
                  <b>{order.contact.name}</b>
                  {order.address.line}, {order.address.area}, {order.address.district}
                  <br />
                  {order.contact.phone}
                </p>
                <h2 className="mt">Need a hand?</h2>
                <p className="muted">Change of address or size? Message us before it&apos;s delivered.</p>
                {chat ? (
                  <a className="btn-o full" href={chat} target="_blank" rel="noopener noreferrer">
                    WhatsApp us
                  </a>
                ) : (
                  <Link className="btn-o full" href="/contact">
                    Contact us
                  </Link>
                )}
                {order.status === 'delivered' ? (
                  <Link className="btn-o full" href={`/contact?topic=exchange&order=${order.orderNumber}`}>
                    Request exchange
                  </Link>
                ) : (
                  <button className="btn-o full dis" type="button" aria-disabled="true" disabled>
                    Request exchange (after delivery)
                  </button>
                )}
              </section>
            </div>
          </>
        )
      }}
    </AccountShell>
  )
}
