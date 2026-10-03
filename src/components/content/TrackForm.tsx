'use client'

import { useActionState } from 'react'

import { trackOrderAction } from '../../app/(frontend)/actions'
import { Icon } from '../ui/Icon'

export function TrackForm({ order }: { order?: string }) {
  const [state, action, pending] = useActionState(trackOrderAction, undefined)
  return (
    <form action={action} className="box form" style={{ maxWidth: 560, width: '100%' }} noValidate>
      <label className="fld">
        <span className="fl">Order number</span>
        <input name="order" type="text" placeholder="DV-24817" defaultValue={state?.fields?.order ?? order} autoCapitalize="characters" required />
      </label>
      <label className="fld">
        <span className="fl">Phone used for the order</span>
        <input name="phone" type="tel" inputMode="tel" placeholder="01XXXXXXXXX" defaultValue={state?.fields?.phone} required />
      </label>
      {state?.error ? (
        <p className="err" role="alert">
          <Icon name="alert" small />
          {state.error}
        </p>
      ) : null}
      <button className="btn lg" type="submit" disabled={pending}>
        {pending ? 'Looking it up' : 'Track order'}
      </button>
    </form>
  )
}
