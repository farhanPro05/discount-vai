import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ForgotForm } from '../../../../../components/account/ResetForms'
import { getCustomer } from '../../../../../lib/customer'

export const metadata: Metadata = { title: 'Forgot your password', robots: { index: false, follow: false } }

export default async function ForgotPage() {
  if (await getCustomer()) redirect('/account/profile')
  return (
    <div className="wrap auth one">
      <ForgotForm />
    </div>
  )
}
