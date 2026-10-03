import type { Metadata } from 'next'

import { ProfileForm } from '../../../../../components/account/AccountForms'
import { AccountShell } from '../../../../../components/account/AccountShell'

export const metadata: Metadata = { title: 'Profile', robots: { index: false, follow: false } }

export default function ProfilePage() {
  return (
    <AccountShell current="/account/profile">
      {(customer) => (
        <>
          <h1 className="pg-h1">Profile</h1>
          <ProfileForm name={customer.name} email={customer.email ?? ''} login={customer.username ?? customer.email ?? ''} />
        </>
      )}
    </AccountShell>
  )
}
