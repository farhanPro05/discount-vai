'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'

import { loginAction, registerAction } from '../../app/(frontend)/actions'
import { Icon } from '../ui/Icon'

/** Log in / Register tabs. Customers use their phone number or email. */
export function AuthForms({ next = '/account/orders', startTab = 'login' }: { next?: string; startTab?: 'login' | 'reg' }) {
  const [tab, setTab] = useState<'login' | 'reg'>(startTab)
  const [loginState, login, loggingIn] = useActionState(loginAction, undefined)
  const [regState, register, registering] = useActionState(registerAction, undefined)

  return (
    <div className="auth-card">
      <div className="tabs" role="tablist">
        <button className={tab === 'login' ? 'tab on' : 'tab'} type="button" role="tab" aria-selected={tab === 'login'} onClick={() => setTab('login')}>
          Log in
        </button>
        <button className={tab === 'reg' ? 'tab on' : 'tab'} type="button" role="tab" aria-selected={tab === 'reg'} onClick={() => setTab('reg')}>
          Register
        </button>
      </div>

      {tab === 'login' ? (
        <form action={login} className="auth-card" style={{ margin: 0 }} noValidate>
          <h1 className="pg-h1">Welcome back, vai</h1>
          <input type="hidden" name="next" value={next} />
          <label className="fld">
            <span className="fl">Phone or email</span>
            <input name="identifier" type="text" placeholder="01XXXXXXXXX or name@example.com" autoComplete="username" defaultValue={loginState?.fields?.identifier} required />
          </label>
          <label className="fld">
            <span className="fl">Password</span>
            <input name="password" type="password" placeholder="Your password" autoComplete="current-password" required />
          </label>
          {loginState?.error ? (
            <p className="err" role="alert">
              <Icon name="alert" small />
              {loginState.error}
            </p>
          ) : null}
          <div className="row-sb">
            <label className="chk">
              <input type="checkbox" name="remember" defaultChecked />
              <span>Keep me logged in</span>
            </label>
            <Link className="lnk" href="/account/forgot">
              Forgot password?
            </Link>
          </div>
          <button className={`btn lg full${loggingIn ? ' is-loading' : ''}`} type="submit" aria-busy={loggingIn}>
            {loggingIn ? <span className="spin" aria-hidden="true" /> : null}
            Log in
          </button>
        </form>
      ) : (
        <form action={register} className="auth-card" style={{ margin: 0 }} noValidate>
          <h1 className="pg-h1">Create your account</h1>
          <label className="fld">
            <span className="fl">Full name</span>
            <input name="name" type="text" placeholder="e.g. Rafi Ahmed" autoComplete="name" defaultValue={regState?.fields?.name} required />
          </label>
          <label className="fld">
            <span className="fl">Phone or email</span>
            <input name="identifier" type="text" placeholder="01XXXXXXXXX or name@example.com" autoComplete="username" defaultValue={regState?.fields?.identifier} required />
          </label>
          <label className="fld">
            <span className="fl">Password</span>
            <input name="password" type="password" placeholder="At least 8 characters" autoComplete="new-password" minLength={8} required />
            <span className="hint">Use 8 or more characters.</span>
          </label>
          <label className="chk">
            <input type="checkbox" name="news" />
            <span>Send me new drops and deals by email. No spam.</span>
          </label>
          {regState?.error ? (
            <p className="err" role="alert">
              <Icon name="alert" small />
              {regState.error}
            </p>
          ) : null}
          <button className={`btn lg full${registering ? ' is-loading' : ''}`} type="submit" aria-busy={registering}>
            {registering ? <span className="spin" aria-hidden="true" /> : null}
            Create account
          </button>
        </form>
      )}
      <p className="muted sm center">
        Just checking out? You don&apos;t need an account.{' '}
        <Link className="lnk" href="/checkout">
          Continue as guest
        </Link>
      </p>
    </div>
  )
}
