'use client'

import { useActionState, useState, useTransition } from 'react'

import { deleteAddressAction, saveAddressAction, updateProfileAction } from '../../app/(frontend)/actions'
import { DHAKA_AREAS, DISTRICTS } from '../../lib/bd'
import { Icon } from '../ui/Icon'

export function ProfileForm({ name, email, login }: { name: string; email: string; login: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined)
  return (
    <form action={action} className="box form" style={{ maxWidth: 560 }}>
      <label className="fld">
        <span className="fl">Full name</span>
        <input name="name" type="text" defaultValue={name} autoComplete="name" required />
      </label>
      <label className="fld">
        <span className="fl">Email</span>
        <input name="email" type="email" defaultValue={email} autoComplete="email" placeholder="name@example.com" />
        <span className="hint">For receipts and delivery updates.</span>
      </label>
      <p className="muted sm">You log in with: {login}</p>
      {state?.error ? (
        <p className="err" role="alert">
          <Icon name="alert" small />
          {state.error}
        </p>
      ) : null}
      {state && 'ok' in state && state.ok ? (
        <p className="note ok" role="status">
          <Icon name="check" small />
          Saved.
        </p>
      ) : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? 'Saving' : 'Save changes'}
      </button>
    </form>
  )
}

export function AddressForm() {
  const [state, action, pending] = useActionState(saveAddressAction, undefined)
  const [district, setDistrict] = useState('Dhaka')
  return (
    <form action={action} className="box form">
      <h2>Add an address</h2>
      <div className="row2">
        <label className="fld">
          <span className="fl">Label</span>
          <input name="label" type="text" placeholder="Home, Office…" />
        </label>
        <label className="fld">
          <span className="fl">District / City</span>
          <span className="sel">
            <select name="district" value={district} onChange={(e) => setDistrict(e.target.value)}>
              {DISTRICTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </span>
        </label>
      </div>
      <label className="fld">
        <span className="fl">Area</span>
        {district === 'Dhaka' ? (
          <span className="sel">
            <select name="area" defaultValue="">
              <option value="">Choose your area</option>
              {DHAKA_AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </span>
        ) : (
          <input name="area" type="text" placeholder="Upazila / thana" />
        )}
      </label>
      <label className="fld">
        <span className="fl">Full address</span>
        <textarea name="line" rows={3} placeholder="House, road, block and a landmark" />
      </label>
      {state?.error ? (
        <p className="err" role="alert">
          <Icon name="alert" small />
          {state.error}
        </p>
      ) : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? 'Saving' : 'Save address'}
      </button>
    </form>
  )
}

export function DeleteAddress({ index }: { index: number }) {
  const [pending, start] = useTransition()
  return (
    <button className="lnk muted-l" type="button" disabled={pending} onClick={() => start(() => deleteAddressAction(index))}>
      {pending ? 'Removing' : 'Remove'}
    </button>
  )
}
