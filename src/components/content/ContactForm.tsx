'use client'

import { useState, useTransition } from 'react'

import { sendMessageAction } from '../../app/(frontend)/actions'
import { Icon } from '../ui/Icon'

const TOPICS = ['Order or delivery', 'Exchange or refund', 'Size help', 'Account or password', 'Something else']

export function ContactForm({ topic, order }: { topic?: string; order?: string }) {
  const start0 = topic === 'exchange' ? TOPICS[1] : topic === 'password' ? TOPICS[3] : TOPICS[0]
  const [f, setF] = useState({ name: '', phone: '', email: '', orderNumber: order ?? '', topic: start0, message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)
  const [pending, start] = useTransition()
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      const res = await sendMessageAction(f)
      if (res.ok) {
        setSent(true)
        setErrors({})
      } else setErrors(res.errors ?? {})
    })
  }

  if (sent) {
    return (
      <div className="box form">
        <p className="note ok" role="status">
          <Icon name="check" small />
          Thanks! We&apos;ll get back to you within a few hours.
        </p>
        <button className="lnk" type="button" onClick={() => setSent(false)} style={{ alignSelf: 'flex-start' }}>
          Send another message
        </button>
      </div>
    )
  }
  const err = (k: string) =>
    errors[k] ? (
      <span className="hint bad" role="alert">
        {errors[k]}
      </span>
    ) : null
  return (
    <form className="box form" onSubmit={submit} noValidate>
      <div className="row2">
        <label className={`fld${errors.name ? ' is-err' : ''}`}>
          <span className="fl">Your name</span>
          <input type="text" autoComplete="name" placeholder="e.g. Rafi Ahmed" value={f.name} onChange={set('name')} />
          {err('name')}
        </label>
        <label className={`fld${errors.phone ? ' is-err' : ''}`}>
          <span className="fl">Phone</span>
          <input type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" value={f.phone} onChange={set('phone')} />
          {err('phone')}
        </label>
      </div>
      <div className="row2">
        <label className={`fld${errors.email ? ' is-err' : ''}`}>
          <span className="fl">
            Email <i className="optl">optional</i>
          </span>
          <input type="email" autoComplete="email" placeholder="name@example.com" value={f.email} onChange={set('email')} />
          {err('email')}
        </label>
        <label className="fld">
          <span className="fl">
            Order number <i className="optl">optional</i>
          </span>
          <input type="text" placeholder="#DV-00000" value={f.orderNumber} onChange={set('orderNumber')} />
        </label>
      </div>
      <label className="fld">
        <span className="fl">Topic</span>
        <span className="sel">
          <select value={f.topic} onChange={set('topic')}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </span>
      </label>
      <label className={`fld${errors.message ? ' is-err' : ''}`}>
        <span className="fl">Message</span>
        <textarea rows={5} placeholder="Tell us what's up" value={f.message} onChange={set('message')} />
        {err('message')}
      </label>
      <button className={`btn lg${pending ? ' is-loading' : ''}`} type="submit" aria-busy={pending}>
        {pending ? <span className="spin" aria-hidden="true" /> : null}
        Send message
      </button>
    </form>
  )
}
