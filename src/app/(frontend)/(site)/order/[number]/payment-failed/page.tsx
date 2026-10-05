import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { PaymentRecovery } from '../../../../../../components/shop/PaymentRecovery'
import { OrderLines } from '../../../../../../components/shop/OrderBits'
import { Icon } from '../../../../../../components/ui/Icon'
import { getCustomer } from '../../../../../../lib/customer'
import { taka, waLink } from '../../../../../../lib/format'
import { getOrderForViewer } from '../../../../../../lib/orders'
import { getCommerceInfo, getSite } from '../../../../../../lib/settings'

export const metadata: Metadata = { title: "Payment didn't go through", robots: { index: false, follow: false } }

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> }

export default async function PaymentFailedPage({ params, searchParams }: Props) {
  const { number } = await params
  const { t } = await searchParams
  const customer = await getCustomer()
  const order = await getOrderForViewer(number, t, customer?.id)
  if (!order) notFound()
  if (order.paymentStatus === 'paid' || order.paymentStatus === 'unpaid_cod') redirect(`/order/${order.orderNumber}?t=${t ?? ''}`)
  const [commerce, site] = await Promise.all([getCommerceInfo(), getSite()])
  const amount = order.paymentMethod === 'online' ? order.total : order.delivery
  const chat = waLink(site.whatsapp, `Hi! My payment for order ${order.orderNumber} didn't go through.`)

  return (
    <div className="wrap narrow res">
      <span className="res-ic bad">
        <Icon name="alert" />
      </span>
      <h1>Payment didn&apos;t go through</h1>
      <p className="res-sub">
        You haven&apos;t been charged. Your order <b>#{order.orderNumber}</b> is saved.
      </p>
      {order.payment?.message ? (
        <div className="box warn">
          <b>What the payment gateway told us</b>
          <p>&ldquo;{order.payment.message}&rdquo;</p>
        </div>
      ) : null}
      <PaymentRecovery
        orderNumber={order.orderNumber}
        token={t ?? ''}
        retryLabel={`Retry payment · ${taka(amount)}`}
        canRetry={commerce.onlineEnabled}
        canCod={commerce.codEnabled && commerce.codZones.includes(order.zone)}
      />
      <p className="res-help">
        Still stuck?{' '}
        {chat ? (
          <a className="lnk" href={chat} target="_blank" rel="noopener noreferrer">
            Message us on WhatsApp
          </a>
        ) : (
          <Link className="lnk" href="/contact">
            Contact us
          </Link>
        )}{' '}
        and we&apos;ll sort it out.
      </p>
      <section className="box">
        <h2>Your saved order</h2>
        <OrderLines order={order} />
      </section>
    </div>
  )
}
