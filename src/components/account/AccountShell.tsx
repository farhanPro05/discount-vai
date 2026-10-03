import Link from 'next/link'
import { redirect } from 'next/navigation'

import { logoutAction } from '../../app/(frontend)/actions'
import { getCustomer } from '../../lib/customer'
import type { Customer } from '../../payload-types'

const NAV = [
  { href: '/account/orders', label: 'My orders' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/wishlist', label: 'Wishlist', soon: true },
]

/** Signed-in account area: side menu on desktop, chips on mobile. Sends visitors to log in first. */
export async function AccountShell({ current, children }: { current: string; children: (customer: Customer) => React.ReactNode }) {
  const customer = await getCustomer()
  if (!customer) redirect(`/account?next=${encodeURIComponent(current)}`)
  const first = customer.name.split(' ')[0]
  return (
    <div className="wrap acct">
      <aside className="acct-nav show-d" aria-label="Account">
        <p className="hi">Hi, {first}</p>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={current.startsWith(n.href) ? 'on' : ''} aria-current={current === n.href ? 'page' : undefined}>
            {n.label}
            {n.soon ? <span className="soon">Soon</span> : null}
          </Link>
        ))}
        <form action={logoutAction}>
          <button type="submit" style={{ width: '100%' }}>
            Log out
          </button>
        </form>
      </aside>
      <div className="acct-main">
        <div className="chips hide-d">
          {NAV.map((n) => (
            <Link key={n.href} className={current.startsWith(n.href) ? 'chip on' : 'chip'} href={n.href}>
              {n.label}
            </Link>
          ))}
          <form action={logoutAction} style={{ display: 'contents' }}>
            <button className="chip" type="submit">
              Log out
            </button>
          </form>
        </div>
        {children(customer)}
      </div>
    </div>
  )
}
