import type { Metadata } from 'next'
import Link from 'next/link'

import { AccountShell } from '../../../../../components/account/AccountShell'
import { OrderThumb, STATUS_LABEL, statusPill } from '../../../../../components/shop/OrderBits'
import { Icon } from '../../../../../components/ui/Icon'
import { formatDate, plural, taka } from '../../../../../lib/format'
import { getClient } from '../../../../../lib/payload'

export const metadata: Metadata = { title: 'My orders', robots: { index: false, follow: false } }

export default async function OrdersPage() {
  return (
    <AccountShell current="/account/orders">
      {async (customer) => {
        const payload = await getClient()
        const res = await payload.find({
          collection: 'orders',
          where: { customer: { equals: customer.id } },
          sort: '-createdAt',
          limit: 50,
          depth: 2,
          overrideAccess: true,
        })
        return (
          <>
            <h1 className="pg-h1">My orders</h1>
            {res.docs.length ? (
              res.docs.map((o) => (
                <Link className="ord" key={o.id} href={`/account/orders/${o.orderNumber}`}>
                  <span className="ord-th">
                    {o.items.slice(0, 3).map((it, i) => (
                      <OrderThumb key={it.id ?? i} item={it} />
                    ))}
                  </span>
                  <span className="ord-m">
                    <b>#{o.orderNumber}</b>
                    <small>
                      {formatDate(o.createdAt)} · {plural(o.items.reduce((n, i) => n + i.qty, 0), 'item')}
                    </small>
                  </span>
                  <span className={statusPill(o.status)}>{STATUS_LABEL[o.status]}</span>
                  <b className="ord-t">{taka(o.total)}</b>
                  <Icon name="chevRight" small />
                </Link>
              ))
            ) : (
              <div className="empty sm">
                <span className="empty-ic">
                  <Icon name="bag" />
                </span>
                <h2>No orders yet</h2>
                <p>When you order while logged in, it shows up here.</p>
                <Link className="btn" href="/men">
                  Start shopping
                </Link>
              </div>
            )}
          </>
        )
      }}
    </AccountShell>
  )
}
