'use client'

import { useState, useTransition } from 'react'

import { subscribeAction } from '../../app/(frontend)/actions'
import { Icon } from '../ui/Icon'

type Source = 'footer' | 'home-teaser' | 'coming-soon'

/** Email sign-up used in the footer, the homepage women's teaser and Coming Soon pages. */
export function NewsletterForm({
  source,
  interest,
  button = 'Join',
  variant = 'light',
  label,
  done = "You're on the list. We'll be in touch.",
}: {
  source: Source
  interest?: string
  button?: string
  variant?: 'light' | 'footer'
  label?: string
  done?: string
}) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<{ ok?: boolean; error?: string }>({})
  const [pending, start] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      const res = await subscribeAction(email, source, interest)
      setState(res.ok ? { ok: true } : { error: res.message })
    })
  }

  if (variant === 'footer') {
    return (
      <form className="ft-news" onSubmit={submit} noValidate>
        {label ? (
          <label className="ft-l" htmlFor={`nl-${source}`}>
            {label}
          </label>
        ) : null}
        {state.ok ? (
          <p className="ft-msg" role="status">
            {done}
          </p>
        ) : (
          <span className="ft-row">
            <input
              id={`nl-${source}`}
              type="email"
              autoComplete="email"
              placeholder="Your email address"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!state.error}
              required
            />
            <button className="btn-inv" type="submit" disabled={pending}>
              {pending ? 'Joining' : button}
            </button>
          </span>
        )}
        {state.error ? (
          <p className="ft-l" role="alert">
            {state.error}
          </p>
        ) : null}
      </form>
    )
  }

  return (
    <div className="nl-wrap">
      {state.ok ? (
        <p className="note ok" role="status">
          <Icon name="check" small />
          {done}
        </p>
      ) : (
        <form className="nl" onSubmit={submit} noValidate>
          <input
            type="email"
            autoComplete="email"
            placeholder="Your email address"
            aria-label={label || 'Email address'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!state.error}
            required
          />
          <button className={`btn${pending ? ' is-loading' : ''}`} type="submit" disabled={pending}>
            {pending ? <span className="spin" aria-hidden="true" /> : null}
            {button}
          </button>
        </form>
      )}
      {state.error ? (
        <p className="err" role="alert">
          <Icon name="alert" small />
          {state.error}
        </p>
      ) : null}
    </div>
  )
}
