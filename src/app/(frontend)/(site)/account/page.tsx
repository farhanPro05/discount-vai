import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthForms } from '../../../../components/account/AuthForms'
import { Lifestyle } from '../../../../components/ui/Art'
import { getCustomer } from '../../../../lib/customer'

export const metadata: Metadata = { title: 'Log in or register', robots: { index: false, follow: false } }

type Props = { searchParams: Promise<{ next?: string; tab?: string }> }

export default async function AccountPage({ searchParams }: Props) {
  const { next, tab } = await searchParams
  if (await getCustomer()) redirect(next?.startsWith('/') ? next : '/account/orders')
  return (
    <div className="wrap auth">
      <Lifestyle className="auth-side show-d" shapes={['panjabi', 'tee']} sizes="50vw">
        <div className="ov">
          <span className="eb">Your Vai account</span>
          <h3>Shop faster, track easier.</h3>
          <ul className="ticks">
            <li>Track every order in one place</li>
            <li>Save your address for quicker checkout</li>
            <li>Members-only deals and early access</li>
          </ul>
        </div>
      </Lifestyle>
      <AuthForms next={next?.startsWith('/') ? next : '/account/orders'} startTab={tab === 'register' ? 'reg' : 'login'} />
    </div>
  )
}
