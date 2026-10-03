'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

import { subscribeAction } from '../../app/(frontend)/actions'
import type { Img } from '../../lib/types'
import { Lifestyle } from '../ui/Art'
import { Icon, type IconName } from '../ui/Icon'
import { useEscape } from './ShopProvider'

export type PopupSettings = {
  enabled: boolean
  eyebrow: string
  heading: string
  text: string
  offer: string
  buttonLabel: string
  image: Img | null
  benefitsHeading: string
  benefits: { icon: IconName; label: string }[]
  successHeading: string
  successText: string
  code: string
  scrollPercent: number
  delaySeconds: number
  hideDays: number
}

const STORE = 'dv-popup'
const SESSION = 'dv-popup-seen'
const BLOCKED = ['/cart', '/checkout', '/order', '/account', '/payment']

type Memory = { closedAt?: number; joined?: boolean }

function read(): Memory {
  try {
    return JSON.parse(window.localStorage.getItem(STORE) || '{}') as Memory
  } catch {
    return {}
  }
}
function write(m: Memory) {
  try {
    window.localStorage.setItem(STORE, JSON.stringify(m))
  } catch {
    /* ignore */
  }
}

/**
 * "Join the Vai List". Shows once per visit after the visitor scrolls ~70% down (or reaches the
 * footer, or moves to leave the page on desktop), never in the first few seconds, never on cart
 * or checkout, stays hidden for N days after closing and never returns after joining.
 */
export function SignupPopup({ s }: { s: PopupSettings }) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'form' | 'error' | 'done'>('form')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [pending, start] = useTransition()
  const pathname = usePathname()
  const started = useRef(Date.now())
  const field = useRef<HTMLInputElement>(null)

  const blocked = BLOCKED.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  const show = useCallback(() => {
    if (Date.now() - started.current < s.delaySeconds * 1000) return false
    try {
      if (window.sessionStorage.getItem(SESSION)) return false
      window.sessionStorage.setItem(SESSION, '1')
    } catch {
      /* ignore */
    }
    setOpen(true)
    return true
  }, [s.delaySeconds])

  useEffect(() => {
    if (!s.enabled || blocked) return
    const m = read()
    if (m.joined) return
    if (m.closedAt && Date.now() - m.closedAt < s.hideDays * 86_400_000) return
    try {
      if (window.sessionStorage.getItem(SESSION)) return
    } catch {
      /* ignore */
    }
    let done = false
    const check = () => {
      if (done) return
      const doc = document.documentElement
      const pct = ((window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight)) * 100
      if (pct >= s.scrollPercent && show()) done = true
    }
    const footer = document.querySelector('footer.ft')
    const io = footer
      ? new IntersectionObserver((entries) => {
          if (!done && entries.some((e) => e.isIntersecting) && show()) done = true
        })
      : null
    if (footer && io) io.observe(footer)
    const exit = (e: MouseEvent) => {
      if (!done && e.clientY <= 0 && window.matchMedia('(hover: hover)').matches && show()) done = true
    }
    window.addEventListener('scroll', check, { passive: true })
    document.addEventListener('mouseout', exit)
    return () => {
      window.removeEventListener('scroll', check)
      document.removeEventListener('mouseout', exit)
      io?.disconnect()
    }
  }, [s.enabled, s.scrollPercent, s.hideDays, blocked, show])

  useEffect(() => {
    if (!open) return
    setTimeout(() => field.current?.focus(), 60)
    document.body.classList.add('lock')
    return () => document.body.classList.remove('lock')
  }, [open])

  const close = useCallback(() => {
    setOpen(false)
    const m = read()
    if (!m.joined) write({ ...m, closedAt: Date.now() })
  }, [])
  useEscape(open, close)

  if (!open || blocked) return null

  const join = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S{2,}$/.test(email.trim())) {
      setPhase('error')
      setError("That email doesn't look right. Try name@example.com")
      return
    }
    start(async () => {
      const res = await subscribeAction(email, 'popup')
      if (res.ok) {
        write({ joined: true })
        setPhase('done')
      } else {
        setPhase('error')
        setError(res.message ?? 'Something went wrong. Please try again.')
      }
    })
  }

  const form = (compact: boolean) =>
    phase === 'done' ? (
      <div className="done">
        <span className="done-ic">
          <Icon name="check" />
        </span>
        <h2>{s.successHeading}</h2>
        {s.successText ? <p className="pm-copy">{s.successText}</p> : null}
        {s.code ? (
          <div className="code">
            <b>{s.code}</b>
            <button
              className="lnk"
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(s.code).then(() => setCopied(true), () => null)
              }}
            >
              {copied ? 'Copied' : 'Copy code'}
            </button>
          </div>
        ) : null}
        <button className="btn lg full" type="button" onClick={close}>
          Start shopping
        </button>
      </div>
    ) : (
      <form onSubmit={join} noValidate style={{ display: 'contents' }}>
        {!compact && s.eyebrow ? <span className="eb">{s.eyebrow}</span> : null}
        <h2 id={compact ? 'pop-t-m' : 'pop-t'}>{s.heading}</h2>
        {s.text ? <p className="pm-copy">{s.text}</p> : null}
        {s.offer ? <span className="offer">{s.offer}</span> : null}
        <label className={`fld${phase === 'error' ? ' is-err' : ''}`}>
          <span className="fl">Email address</span>
          <input
            ref={compact ? undefined : field}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (phase === 'error') setPhase('form')
            }}
            placeholder="name@example.com"
            aria-invalid={phase === 'error'}
          />
        </label>
        {phase === 'error' ? (
          <p className="err" role="alert">
            <Icon name="alert" small />
            {error}
          </p>
        ) : null}
        <button className={`btn lg full${pending ? ' is-loading' : ''}`} type="submit" aria-busy={pending}>
          {pending ? <span className="spin" aria-hidden="true" /> : null}
          {pending ? 'Joining' : s.buttonLabel}
        </button>
        <p className="fine">
          No spam, unsubscribe anytime. <Link href="/privacy-policy">Privacy</Link>
        </p>
      </form>
    )

  return (
    <div className="pop-layer">
      <button className="scrim" type="button" aria-label="Close" onClick={close} />
      <div className="pm" role="dialog" aria-modal="true" aria-labelledby="pop-t">
        <Lifestyle className="pm-img" img={s.image} shapes={['panjabi', 'tee']} sizes="440px">
          <div className="pm-ben">
            {s.benefitsHeading ? <p className="pm-bh">{s.benefitsHeading}</p> : null}
            {s.benefits.map((b) => (
              <span className="ben" key={b.label}>
                <Icon name={b.icon} />
                {b.label}
              </span>
            ))}
          </div>
        </Lifestyle>
        <div className="pm-body">
          <button className="ib pm-x" type="button" aria-label="Close" onClick={close}>
            <Icon name="x" />
          </button>
          {form(false)}
        </div>
      </div>
      <div className="psheet" role="dialog" aria-modal="true" aria-labelledby="pop-t-m">
        <Lifestyle className="ps-strip" img={s.image} shapes={['panjabi']} sizes="100vw">
          <button className="ps-x" type="button" aria-label="Close" onClick={close}>
            <Icon name="x" />
          </button>
        </Lifestyle>
        <div className="ps-body">{form(true)}</div>
      </div>
    </div>
  )
}
