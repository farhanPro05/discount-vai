'use client'

import { useState, useTransition } from 'react'

import { retryPaymentAction, switchToCodAction } from '../../app/(frontend)/actions'
import { Icon } from '../ui/Icon'

/** "Retry payment" and "Switch to Cash on Delivery" on the payment-failed page. */
export function PaymentRecovery({
  orderNumber,
  token,
  retryLabel,
  canRetry,
  canCod,
}: {
  orderNumber: string
  token: string
  retryLabel: string
  canRetry: boolean
  canCod: boolean
}) {
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const run = (fn: () => Promise<{ ok: false; message: string } | undefined | void>) =>
    start(async () => {
      const res = await fn()
      if (res && 'message' in res) setError(res.message)
    })
  return (
    <>
      <div className="empty-a">
        {canRetry ? (
          <button className="btn lg" type="button" disabled={pending} onClick={() => run(() => retryPaymentAction(orderNumber, token))}>
            {retryLabel}
          </button>
        ) : null}
        {canCod ? (
          <button className="btn-o" type="button" disabled={pending} onClick={() => run(() => switchToCodAction(orderNumber, token))}>
            Switch to Cash on Delivery
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="err" role="alert">
          <Icon name="alert" small />
          {error}
        </p>
      ) : null}
    </>
  )
}
