'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { forgotPasswordAction, resetPasswordAction } from '../../app/(frontend)/actions'
import { Icon } from '../ui/Icon'

const Err = ({ children }: { children: React.ReactNode }) => (
  <p className="err" role="alert">
    <Icon name="alert" small />
    {children}
  </p>
)

/** Step 1: ask for the account's email and send the reset link. */
export function ForgotForm() {
  const [state, send, sending] = useActionState(forgotPasswordAction, undefined)

  if (state?.sent) {
    return (
      <div className="auth-card" role="status">
        <h1 className="pg-h1">Check your email</h1>
        <p className="muted">
          If an account uses <b>{state.email}</b>, we&apos;ve sent it a link to choose a new password. The link works for 1 hour; check your spam folder
          too.
        </p>
        <Link className="btn-o lg full" href="/account">
          Back to log in
        </Link>
      </div>
    )
  }

  return (
    <form action={send} className="auth-card" noValidate>
      <h1 className="pg-h1">Forgot your password?</h1>
      <p className="muted">Enter the email on your account and we&apos;ll send you a link to choose a new one.</p>
      <label className="fld">
        <span className="fl">Email</span>
        <input name="email" type="email" placeholder="name@example.com" autoComplete="email" defaultValue={state?.email} required />
      </label>
      {state?.error ? <Err>{state.error}</Err> : null}
      <button className={`btn lg full${sending ? ' is-loading' : ''}`} type="submit" aria-busy={sending}>
        {sending ? <span className="spin" aria-hidden="true" /> : null}
        Send reset link
      </button>
      <p className="muted sm">
        Signed up with only your phone number?{' '}
        <Link className="lnk" href="/contact?topic=password">
          Contact us
        </Link>{' '}
        and we&apos;ll help you back in.
      </p>
    </form>
  )
}

/** Step 2: choose a new password from the emailed link. */
export function ResetForm({ token }: { token: string }) {
  const [state, reset, saving] = useActionState(resetPasswordAction, undefined)

  if (!token || state?.error === 'expired') {
    return (
      <div className="auth-card" role="status">
        <h1 className="pg-h1">This link has expired</h1>
        <p className="muted">Reset links work once, for 1 hour. Ask for a new one and use the latest email.</p>
        <Link className="btn lg full" href="/account/forgot">
          Send a new link
        </Link>
      </div>
    )
  }

  return (
    <form action={reset} className="auth-card" noValidate>
      <h1 className="pg-h1">Choose a new password</h1>
      <input type="hidden" name="token" value={token} />
      <label className="fld">
        <span className="fl">New password</span>
        <input name="password" type="password" placeholder="8 or more characters" autoComplete="new-password" minLength={8} required />
      </label>
      <label className="fld">
        <span className="fl">Type it again</span>
        <input name="confirm" type="password" placeholder="Same password" autoComplete="new-password" minLength={8} required />
      </label>
      {state?.error ? <Err>{state.error}</Err> : null}
      <button className={`btn lg full${saving ? ' is-loading' : ''}`} type="submit" aria-busy={saving}>
        {saving ? <span className="spin" aria-hidden="true" /> : null}
        Save and log in
      </button>
    </form>
  )
}
