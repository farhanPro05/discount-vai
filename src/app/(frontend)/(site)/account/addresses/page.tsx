import type { Metadata } from 'next'

import { AddressForm, DeleteAddress } from '../../../../../components/account/AccountForms'
import { AccountShell } from '../../../../../components/account/AccountShell'

export const metadata: Metadata = { title: 'Addresses', robots: { index: false, follow: false } }

export default function AddressesPage() {
  return (
    <AccountShell current="/account/addresses">
      {(customer) => (
        <>
          <h1 className="pg-h1">Addresses</h1>
          <p className="muted" style={{ marginBottom: 20 }}>
            Your first address fills in automatically at checkout.
          </p>
          {(customer.addresses ?? []).map((a, i) => (
            <div className="ord" key={a.id ?? i}>
              <span className="ord-m">
                <b>
                  {a.label || 'Address'}
                  {i === 0 ? ' · default' : ''}
                </b>
                <small>
                  {a.line}, {a.area}, {a.district}
                </small>
              </span>
              <DeleteAddress index={i} />
            </div>
          ))}
          <AddressForm />
        </>
      )}
    </AccountShell>
  )
}
