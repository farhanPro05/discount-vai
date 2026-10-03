import type { Metadata } from 'next'
import Link from 'next/link'

import { TrackForm } from '../../../../components/content/TrackForm'
import { Icon } from '../../../../components/ui/Icon'
import { getCustomer } from '../../../../lib/customer'

export const metadata: Metadata = { title: 'Track your order', robots: { index: false, follow: true } }

type Props = { searchParams: Promise<{ order?: string }> }

export default async function TrackOrderPage({ searchParams }: Props) {
  const { order } = await searchParams
  const customer = await getCustomer()
  return (
    <div className="wrap narrow res">
      <span className="empty-ic">
        <Icon name="truck" />
      </span>
      <h1>Track your order</h1>
      <p className="res-sub">Enter your order number (it&apos;s in your confirmation and SMS) and the phone number you ordered with.</p>
      <TrackForm order={order} />
      <p className="res-help">
        {customer ? (
          <>
            Or see all your orders in <Link className="lnk" href="/account/orders">My orders</Link>.
          </>
        ) : (
          <>
            Have an account? <Link className="lnk" href="/account?next=/account/orders">Log in</Link> to see every order.
          </>
        )}
      </p>
    </div>
  )
}
