import Image from 'next/image'

import type { ShapeKey } from '../../fields/shapes'
import { taka } from '../../lib/format'
import { toImgs } from '../../lib/media'
import type { Order, Product } from '../../payload-types'
import { Sil } from '../ui/Art'

type Item = Order['items'][number]

function thumbFor(item: Item) {
  const p = typeof item.product === 'object' ? (item.product as Product | null) : null
  const colour = p?.colours?.find((c) => c.name === item.colour) ?? p?.colours?.[0]
  return { img: toImgs(colour?.images)[0] ?? null, hex: colour?.hex, shape: ((p?.shape as ShapeKey) ?? 'tee') as ShapeKey }
}

export function OrderThumb({ item, qty }: { item: Item; qty?: number }) {
  const t = thumbFor(item)
  return (
    <span className="l-th sm">
      <span>{t.img ? <Image src={t.img.url} alt="" fill sizes="52px" /> : <Sil shape={t.shape} fill={t.hex} className="" />}</span>
      {qty ? <i>{qty}</i> : null}
    </span>
  )
}

/** Items and totals of an order (confirmation, payment failed, account). */
export function OrderLines({ order, totalLabel = 'Total' }: { order: Order; totalLabel?: string }) {
  return (
    <>
      {order.items.map((it, i) => (
        <div className="s-line" key={it.id ?? i}>
          <OrderThumb item={it} qty={it.qty} />
          <span className="s-n">
            {it.name}
            <small>
              {it.colour} · {it.size}
            </small>
          </span>
          <b>{taka(it.lineTotal)}</b>
        </div>
      ))}
      <div className="sum-r">
        <span>Subtotal</span>
        <span>{taka(order.subtotal)}</span>
      </div>
      <div className="sum-r">
        <span>Delivery ({order.zone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
        <span>{order.delivery ? taka(order.delivery) : 'Free'}</span>
      </div>
      {order.discount ? (
        <div className="sum-r ok">
          <span>Discount{order.discountCode ? ` (${order.discountCode})` : ''}</span>
          <span>-{taka(order.discount)}</span>
        </div>
      ) : null}
      {order.advancePaid ? (
        <div className="sum-r ok">
          <span>Paid online</span>
          <span>-{taka(order.advancePaid)}</span>
        </div>
      ) : null}
      <div className="sum-r big">
        <span>{totalLabel}</span>
        <b>{taka(order.total - (order.advancePaid ?? 0))}</b>
      </div>
    </>
  )
}

export const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

export const statusPill = (s: Order['status']) => (s === 'delivered' ? 'pill-s ok' : s === 'shipped' || s === 'confirmed' ? 'pill-s info' : 'pill-s')

export const paymentLabel = (o: Order) =>
  o.paymentMethod === 'online' ? (o.paymentStatus === 'paid' ? `Paid online${o.payment?.cardType ? ` (${o.payment.cardType})` : ''}` : 'Online payment') : 'Cash on Delivery'
