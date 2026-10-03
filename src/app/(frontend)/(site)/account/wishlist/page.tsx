import type { Metadata } from 'next'
import Link from 'next/link'

import { AccountShell } from '../../../../../components/account/AccountShell'
import { Icon } from '../../../../../components/ui/Icon'

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false, follow: false } }

export default function WishlistPage() {
  return (
    <AccountShell current="/account/wishlist">
      {() => (
        <div className="empty sm">
          <span className="empty-ic">
            <Icon name="star" />
          </span>
          <span className="soon lg">Coming soon</span>
          <h1 className="pg-h1" style={{ margin: 0 }}>
            Wishlist is on its way
          </h1>
          <p>Soon you&apos;ll be able to save favourites and get a heads-up when they go on sale.</p>
          <Link className="btn" href="/men">
            Keep shopping
          </Link>
        </div>
      )}
    </AccountShell>
  )
}
