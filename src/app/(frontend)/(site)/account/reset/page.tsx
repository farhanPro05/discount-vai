import type { Metadata } from 'next'

import { ResetForm } from '../../../../../components/account/ResetForms'

export const metadata: Metadata = { title: 'Choose a new password', robots: { index: false, follow: false } }

type Props = { searchParams: Promise<{ token?: string }> }

export default async function ResetPage({ searchParams }: Props) {
  const { token } = await searchParams
  return (
    <div className="wrap auth one">
      <ResetForm token={token ?? ''} />
    </div>
  )
}
