import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { OrderLines, paymentLabel } from '../../../../../components/shop/OrderBits'
import { Icon } from '../../../../../components/ui/Icon'
import { getCustomer } from '../../../../../lib/customer'
import { formatDate, taka } from '../../../../../lib/format'
import { getOrderForViewer } from '../../../../../lib/orders'
import { getCommerceInfo } from '../../../../../lib/settings'

export const metadata: Metadata = { title: 'Order confirmed', robots: { index: false, follow: false } }

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> }

export default async function OrderPage({ params, searchParams }: Props) {
  const { number } = await params
  const { t } = await searchParams
  const customer = await getCustomer()
  const order = await getOrderForViewer(number, t, customer?.id)
  if (!order) notFound()
  if (order.paymentStatus === 'failed') redirect(`/order/${order.orderNumber}/payment-failed?t=${t ?? ''}`)
  const commerce = await getCommerceInfo()
  const eta = order.zone === 'inside' ? commerce.inside.eta : commerce.outside.eta
  const first = order.contact.name.split(' ')[0]
  const cod = order.paymentMethod === 'cod'
  const awaiting = order.paymentStatus === 'pending'
  const due = order.total - (order.advancePaid ?? 0)
  const trackHref = customer ? `/account/orders/${order.orderNumber}` : `/track-order?order=${encodeURIComponent(order.orderNumber)}`

  return (
    <div className="wrap narrow res">
      <span className="res-ic ok">
        <Icon name="check" />
      </span>
      <h1>{awaiting ? `Almost there, ${first}!` : `Thanks, ${first}! Your order is in.`}</h1>
      <p className="res-sub">
        Order <b>#{order.orderNumber}</b> · placed {formatDate(order.createdAt, true)} · {paymentLabel(order)}
      </p>
      {awaiting ? (
        <p className="note info">
          <Icon name="clock" small />
          We&apos;re waiting for the payment confirmation from SSLCommerz. This page updates once it arrives.
        </p>
      ) : null}
      <div className="res-grid">
        <section className="box">
          <h2>What happens next</h2>
          <ol className="next">
            <li>
              <span className="n">1</span>
              <span>
                <b>We call to confirm</b>
                {commerce.nextSteps.call} Keep {order.contact.phone} handy.
              </span>
            </li>
            <li>
              <span className="n">2</span>
              <span>
                <b>Packed and shipped</b>
                {commerce.nextSteps.ship}
              </span>
            </li>
            <li>
              <span className="n">3</span>
              <span>
                <b>Delivered in {eta}</b>
                {cod && due > 0 ? `Pay ${taka(due)} in cash to the rider. Check the items before you pay.` : 'Already paid. Just check the items when they arrive.'}
              </span>
            </li>
          </ol>
        </section>
        <section className="box">
          <h2>Order summary</h2>
          <OrderLines order={order} totalLabel={cod ? 'Total to pay on delivery' : 'Total paid'} />
          <p className="addr">
            <b>Delivering to</b>
            {order.contact.name} · {order.address.line}, {order.address.area}, {order.address.district} · {order.contact.phone}
          </p>
        </section>
      </div>
      <div className="empty-a">
        <Link className="btn lg" href={trackHref}>
          Track your order
        </Link>
        <Link className="btn-o" href="/">
          Keep shopping
        </Link>
      </div>
      <p className="res-help">
        Save this page: it&apos;s your receipt. Questions? <Link className="lnk" href="/contact">Contact us</Link>
      </p>
    </div>
  )
}
