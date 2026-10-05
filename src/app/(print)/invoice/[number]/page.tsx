import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { formatDate, isPlaceholder, taka } from '../../../../lib/format'
import { toImg } from '../../../../lib/media'
import { getClient } from '../../../../lib/payload'
import { getBrand, getCommerce, getSite } from '../../../../lib/settings'
import { PrintButton } from './PrintButton'

type Props = { params: Promise<{ number: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params
  return { title: `Invoice ${decodeURIComponent(number)} · Discount Vai` }
}

const ZONE = { inside: 'Inside Dhaka', outside: 'Outside Dhaka' } as const

/** A printable invoice for the parcel. Staff only: opened from the order in the admin. */
export default async function InvoicePage({ params }: Props) {
  const number = decodeURIComponent((await params).number)
  const payload = await getClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || user.collection !== 'users') redirect(`/admin/login?redirect=${encodeURIComponent(`/invoice/${number}`)}`)

  const res = await payload.find({ collection: 'orders', where: { orderNumber: { equals: number } }, limit: 1, depth: 0, overrideAccess: false, user })
  const order = res.docs[0]
  if (!order) {
    return (
      <main className="pr-page">
        <h1 className="pr-h">Order {number} not found</h1>
        <p>Check the order number in the admin.</p>
      </main>
    )
  }

  const [site, brand, commerce] = await Promise.all([getSite(), getBrand(), getCommerce()])
  const logo = toImg(brand.logo, 'Discount Vai')
  const contact = [site.phone, site.email].filter((v): v is string => !!v && !isPlaceholder(v))
  const advance = order.advancePaid ?? 0
  const paidOnline = order.paymentMethod === 'online' && order.paymentStatus === 'paid'
  const collect = order.paymentMethod === 'cod' ? Math.max(0, order.total - advance) : 0
  const exchangeDays = commerce.exchangeDays ?? 7

  return (
    <main className="pr-page">
      <div className="pr-bar">
        <PrintButton />
        <a className="pr-lnk" href={`/admin/collections/orders/${order.id}`}>
          Back to the order
        </a>
      </div>

      <header className="pr-top">
        <div>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pr-logo" src={logo.url} alt="Discount Vai" />
          ) : (
            <p className="pr-wm">
              <span>Discount</span> <b>Vai</b>
            </p>
          )}
          {contact.length ? <p className="pr-muted">{contact.join(' · ')}</p> : null}
        </div>
        <div className="pr-meta">
          <p className="pr-h">Invoice</p>
          <p>
            <b>{order.orderNumber}</b>
          </p>
          <p className="pr-muted">{formatDate(order.createdAt, true)}</p>
        </div>
      </header>

      <section className="pr-cols">
        <div>
          <p className="pr-lbl">Deliver to</p>
          <p>
            <b>{order.contact.name}</b>
            <br />
            {order.contact.phone}
            <br />
            {order.address.line}
            <br />
            {order.address.area}, {order.address.district}
          </p>
          <p className="pr-muted">{ZONE[order.zone]}</p>
        </div>
        <div className={collect ? 'pr-due' : 'pr-due paid'}>
          <p className="pr-lbl">{collect ? 'Collect in cash' : 'Amount due'}</p>
          <p className="pr-big">{taka(collect)}</p>
          <p className="pr-muted">
            {collect
              ? advance
                ? `Cash on Delivery · ${taka(advance)} paid online`
                : 'Cash on Delivery'
              : paidOnline
                ? 'Paid online'
                : order.paymentMethod === 'online'
                  ? 'Online payment pending'
                  : 'Paid'}
          </p>
        </div>
      </section>

      <table className="pr-tbl">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Qty</th>
            <th scope="col" className="r">
              Price
            </th>
            <th scope="col" className="r">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i, n) => (
            <tr key={i.id ?? n}>
              <td>
                {i.name}
                <span className="pr-muted"> · {[i.colour, i.size].filter(Boolean).join(' · ')}</span>
              </td>
              <td>{i.qty}</td>
              <td className="r">{taka(i.unitPrice)}</td>
              <td className="r">{taka(i.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="pr-sum">
        <dt>Subtotal</dt>
        <dd>{taka(order.subtotal)}</dd>
        <dt>Delivery ({ZONE[order.zone]})</dt>
        <dd>{order.delivery ? taka(order.delivery) : 'Free'}</dd>
        {order.discount ? (
          <>
            <dt>Discount{order.discountCode ? ` (${order.discountCode})` : ''}</dt>
            <dd>-{taka(order.discount)}</dd>
          </>
        ) : null}
        <dt className="tot">Total</dt>
        <dd className="tot">{taka(order.total)}</dd>
      </dl>

      {order.notes ? (
        <p className="pr-note">
          <b>Customer&apos;s note:</b> {order.notes}
        </p>
      ) : null}
      {order.shipping?.courier || order.shipping?.trackingId ? (
        <p className="pr-muted">
          {[order.shipping?.courier, order.shipping?.trackingId ? `Tracking ${order.shipping.trackingId}` : null].filter(Boolean).join(' · ')}
        </p>
      ) : null}

      <footer className="pr-foot">
        Thank you for shopping with Discount Vai.{exchangeDays ? ` You can exchange any item within ${exchangeDays} days; please keep this invoice.` : ''}
      </footer>
    </main>
  )
}
