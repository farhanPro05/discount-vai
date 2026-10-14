'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'

import { checkCodeAction, placeOrderAction } from '../../app/(frontend)/actions'
import { trackBeginCheckout } from '../../lib/analytics'
import { DHAKA_AREAS, DISTRICTS } from '../../lib/bd'
import { taka } from '../../lib/format'
import type { CommerceInfo } from '../../lib/settings'
import { Icon } from '../ui/Icon'
import { LineThumb } from './CartBits'
import { CODE_KEY } from './CartView'
import { useStoredString } from './storage'
import { useShop } from './ShopProvider'
import { useCartSync } from './useCartSync'

type Prefill = { name?: string; phone?: string; email?: string; district?: string; area?: string; address?: string }
type Errors = Partial<Record<'name' | 'phone' | 'email' | 'district' | 'area' | 'address' | 'zone' | 'code', string>>

export function CheckoutForm({ commerce, prefill }: { commerce: CommerceInfo; prefill: Prefill }) {
  const { lines, ready, subtotal, clear } = useShop()
  const { problems: syncProblems } = useCartSync()
  const router = useRouter()

  const [name, setName] = useState(prefill.name ?? '')
  const [phone, setPhone] = useState(prefill.phone ?? '')
  const [email, setEmail] = useState(prefill.email ?? '')
  const [district, setDistrict] = useState(prefill.district ?? 'Dhaka')
  const [area, setArea] = useState(prefill.area ?? '')
  const [address, setAddress] = useState(prefill.address ?? '')
  const [zone, setZone] = useState<'inside' | 'outside'>((prefill.district ?? 'Dhaka') === 'Dhaka' ? 'inside' : 'outside')
  const [notes, setNotes] = useState('')
  const [typed, setCode] = useState<string | null>(null)
  const [disc, setDisc] = useState<{ code: string; amount: number } | null>(null)
  const [codeMsg, setCodeMsg] = useState('')
  const [subscribe, setSubscribe] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [problems, setProblems] = useState<string[]>([])
  const [sumOpen, setSumOpen] = useState(false)
  const [placing, startPlace] = useTransition()
  const [checking, startCheck] = useTransition()

  const codAllowed = commerce.codEnabled && commerce.codZones.includes(zone)
  const [chosenPayment, setPayment] = useState<'cod' | 'online'>(commerce.codEnabled ? 'cod' : 'online')
  // COD isn't allowed for this zone: fall back to online payment when it's available.
  const payment = chosenPayment === 'cod' && !codAllowed && commerce.onlineEnabled ? 'online' : chosenPayment

  const cartLines = useMemo(() => lines.map((l) => ({ productId: l.productId, colour: l.colour, size: l.size, qty: l.qty })), [lines])

  // Count the checkout once per visit to this page (after the analytics scripts have started).
  const checkoutSent = useRef(false)
  useEffect(() => {
    if (!ready || !lines.length || checkoutSent.current) return
    const t = setTimeout(() => {
      checkoutSent.current = true
      trackBeginCheckout(lines.map((l) => ({ productId: l.productId, name: l.name, colour: l.colour, size: l.size, price: l.price, qty: l.qty })))
    }, 1500)
    return () => clearTimeout(t)
  }, [ready, lines])

  // Re-apply a code the shopper entered on the cart page.
  const savedCode = useStoredString(CODE_KEY, 'session')
  const code = typed ?? savedCode
  useEffect(() => {
    if (!ready || !lines.length || !savedCode) return
    let live = true
    checkCodeAction(savedCode, cartLines).then((r) => live && r.ok && setDisc({ code: r.code, amount: r.discount }))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, savedCode])

  const fee = zone === 'inside' ? commerce.inside.fee : commerce.outside.fee
  const delivery = commerce.freeOver && subtotal >= commerce.freeOver ? 0 : fee
  const discount = disc ? Math.min(disc.amount, subtotal) : 0
  const total = Math.max(0, subtotal - discount + delivery)
  const advance = payment === 'cod' && commerce.codAdvance && delivery > 0

  const applyCode = () =>
    startCheck(async () => {
      const res = await checkCodeAction(code, cartLines)
      if (res.ok) {
        setDisc({ code: res.code, amount: res.discount })
        setCodeMsg(`${res.code} applied: you save ${taka(res.discount)}.`)
        setErrors((e) => ({ ...e, code: undefined }))
        try {
          window.sessionStorage.setItem(CODE_KEY, res.code)
        } catch {
          /* ignore */
        }
      } else {
        setDisc(null)
        setCodeMsg('')
        setErrors((e) => ({ ...e, code: res.message }))
      }
    })

  // One order per click: pressing Enter twice quickly must not place two orders.
  const placingRef = useRef(false)
  const place = () => {
    if (placingRef.current) return
    placingRef.current = true
    setMessage('')
    setProblems([])
    startPlace(async () => {
      const res = await placeOrderAction({
        lines: cartLines,
        name,
        phone,
        email,
        district,
        area,
        address,
        zone,
        notes,
        code: disc?.code ?? '',
        payment,
        subscribe,
      }).catch(() => ({ ok: false as const, message: 'We could not reach the shop. Check your connection and try again.' }))
      if (res.ok) {
        clear()
        try {
          window.sessionStorage.removeItem(CODE_KEY)
        } catch {
          /* ignore */
        }
        if (res.redirect.startsWith('http')) window.location.assign(res.redirect)
        else router.push(res.redirect)
        return
      }
      placingRef.current = false
      setErrors('errors' in res ? (res.errors ?? {}) : {})
      setMessage(res.message ?? 'Something went wrong. Please try again.')
      setProblems('problems' in res ? (res.problems ?? []) : [])
      const first = Object.keys('errors' in res ? (res.errors ?? {}) : {})[0]
      if (first) document.getElementById(`co-${first}`)?.focus()
    })
  }

  if (!ready) return <div className="empty" aria-busy="true" />
  if (!lines.length) {
    return (
      <div className="empty">
        <span className="empty-ic">
          <Icon name="bag" />
        </span>
        <h2>Your cart is empty</h2>
        <p>Add something you like, then come back here to check out.</p>
        <Link className="btn lg" href="/men">
          Shop Men
        </Link>
      </div>
    )
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <span className="hint bad" role="alert">
        {errors[k]}
      </span>
    ) : null
  const placeLabel = payment === 'online' ? `Pay ${taka(total)} securely` : advance ? `Pay ${taka(delivery)} delivery & place order` : `Place order · ${taka(total)}`

  const summaryLines = (
    <>
      {lines.map((l) => (
        <div className="s-line" key={l.key}>
          <LineThumb line={l} small qty={l.qty} />
          <span className="s-n">
            {l.name}
            <small>
              {l.colour} · {l.size}
            </small>
          </span>
          <b>{taka(l.price * l.qty)}</b>
        </div>
      ))}
      <div className="sum-r">
        <span>Subtotal</span>
        <span>{taka(subtotal)}</span>
      </div>
      <div className="sum-r">
        <span>Delivery ({zone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
        <span>{delivery ? taka(delivery) : 'Free'}</span>
      </div>
      {discount ? (
        <div className="sum-r ok">
          <span>Discount ({disc?.code})</span>
          <span>-{taka(discount)}</span>
        </div>
      ) : null}
    </>
  )
  const terms = (
    <p className="muted sm">
      By placing your order you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy-policy">Privacy policy</Link>.
    </p>
  )
  const allProblems = [...syncProblems, ...problems]

  return (
    <>
      <h1 className="pg-h1">Checkout</h1>
      <button className="co-tog hide-d" type="button" aria-expanded={sumOpen} onClick={() => setSumOpen(!sumOpen)}>
        <span>
          <Icon name="bag" small />
          {sumOpen ? 'Hide order summary' : 'Show order summary'}
        </span>
        <b>{taka(total)}</b>
      </button>
      {sumOpen ? <div className="sumc flat hide-d">{summaryLines}</div> : null}

      {allProblems.length || message ? (
        <div className="note bad" role="alert" style={{ marginBottom: 20 }}>
          <Icon name="alert" small />
          <span>
            {message} {allProblems.join(' ')}
          </span>
        </div>
      ) : null}

      <div className="co-l">
        <form
          className="co-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            place()
          }}
        >
          <section className="co-s" aria-labelledby="co-h1">
            <h2 id="co-h1">
              <span className="num">1</span>Contact
            </h2>
            <div className="row2">
              <label className={`fld${errors.phone ? ' is-err' : ''}`}>
                <span className="fl">
                  Phone number <i className="req">required</i>
                </span>
                <input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} aria-required="true" aria-invalid={!!errors.phone} />
                {err('phone') ?? <span className="hint">We call or SMS to confirm your order.</span>}
              </label>
              <label className={`fld${errors.email ? ' is-err' : ''}`}>
                <span className="fl">
                  Email <i className="optl">optional</i>
                </span>
                <input id="co-email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
                {err('email') ?? <span className="hint">For your receipt and delivery updates.</span>}
              </label>
            </div>
          </section>

          <section className="co-s" aria-labelledby="co-h2">
            <h2 id="co-h2">
              <span className="num">2</span>Delivery address
            </h2>
            <label className={`fld${errors.name ? ' is-err' : ''}`}>
              <span className="fl">
                Full name <i className="req">required</i>
              </span>
              <input id="co-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-required="true" aria-invalid={!!errors.name} />
              {err('name')}
            </label>
            <div className="row2">
              <label className={`fld${errors.district ? ' is-err' : ''}`}>
                <span className="fl">
                  District / City <i className="req">required</i>
                </span>
                <span className="sel">
                  <select
                    id="co-district"
                    value={district}
                    autoComplete="address-level1"
                    onChange={(e) => {
                      setDistrict(e.target.value)
                      setArea('')
                      setZone(e.target.value === 'Dhaka' ? 'inside' : 'outside')
                    }}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </span>
                {err('district')}
              </label>
              <label className={`fld${errors.area ? ' is-err' : ''}`}>
                <span className="fl">
                  Area <i className="req">required</i>
                </span>
                {district === 'Dhaka' ? (
                  <span className="sel">
                    <select id="co-area" value={area} onChange={(e) => setArea(e.target.value)} aria-invalid={!!errors.area}>
                      <option value="">Choose your area</option>
                      {DHAKA_AREAS.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </span>
                ) : (
                  <input id="co-area" type="text" autoComplete="address-level2" placeholder="Upazila / thana" value={area} onChange={(e) => setArea(e.target.value)} aria-invalid={!!errors.area} />
                )}
                {err('area')}
              </label>
            </div>
            <label className={`fld${errors.address ? ' is-err' : ''}`}>
              <span className="fl">
                Full address <i className="req">required</i>
              </span>
              <textarea
                id="co-address"
                rows={3}
                autoComplete="street-address"
                placeholder="House, road, block and a landmark the rider can find"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.address}
              />
              {err('address')}
            </label>
          </section>

          <section className="co-s" aria-labelledby="co-h3">
            <h2 id="co-h3">
              <span className="num">3</span>Delivery zone
            </h2>
            <div className="opts2" role="radiogroup" aria-label="Delivery zone">
              {(
                [
                  ['inside', 'Inside Dhaka', commerce.inside],
                  ['outside', 'Outside Dhaka', commerce.outside],
                ] as const
              ).map(([k, label, z]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={zone === k}
                  className={zone === k ? 'ocard on' : 'ocard'}
                  onClick={() => setZone(k)}
                  // Inside-Dhaka delivery is only for Dhaka addresses (the server checks this too).
                  disabled={k === 'inside' && district !== 'Dhaka'}
                >
                  <span className="radio" />
                  <span className="oc-t">
                    <b>{label}</b>
                    <small>{z.eta}</small>
                  </span>
                  <b className="oc-p">{commerce.freeOver && subtotal >= commerce.freeOver ? 'Free' : taka(z.fee)}</b>
                </button>
              ))}
            </div>
            {commerce.freeOver && subtotal < commerce.freeOver ? (
              <p className="hint">Add {taka(commerce.freeOver - subtotal)} more for free delivery.</p>
            ) : null}
          </section>

          <section className="co-s" aria-labelledby="co-h4">
            <h2 id="co-h4">
              <span className="num">4</span>Notes and discount
            </h2>
            <label className="fld">
              <span className="fl">
                Order notes <i className="optl">optional</i>
              </span>
              <textarea rows={2} placeholder="e.g. Please call before coming, gate code 12" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <label className={`fld${errors.code ? ' is-err' : ''}`}>
              <span className="fl">Discount code</span>
              <span className="fld-row">
                <input
                  id="co-code"
                  type="text"
                  placeholder="e.g. VAI10"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    // Enter applies the code instead of submitting the whole order.
                    if (e.key !== 'Enter') return
                    e.preventDefault()
                    if (code.trim() && !checking) applyCode()
                  }}
                  autoCapitalize="characters"
                  enterKeyHint="done"
                />
                <button className="btn-o" type="button" onClick={applyCode} disabled={checking || !code.trim()}>
                  {checking ? '…' : 'Apply'}
                </button>
              </span>
              {errors.code ? <span className="hint bad">{errors.code}</span> : codeMsg ? <span className="hint ok">{codeMsg}</span> : null}
            </label>
          </section>

          <section className="co-s" aria-labelledby="co-h5">
            <h2 id="co-h5">
              <span className="num">5</span>Payment
            </h2>
            <div className="opts2" role="radiogroup" aria-label="Payment method">
              <button type="button" role="radio" aria-checked={payment === 'cod'} className={payment === 'cod' ? 'ocard big on' : 'ocard big'} onClick={() => setPayment('cod')} disabled={!codAllowed}>
                <span className="radio" />
                <span className="oc-t">
                  <b>Cash on Delivery</b>
                  <small>
                    {!commerce.codEnabled
                      ? 'Not available right now.'
                      : !codAllowed
                        ? 'Not available for this delivery zone.'
                        : commerce.codAdvance
                          ? 'Pay the delivery charge online now, the rest in cash when your order arrives.'
                          : 'Pay in cash when your order arrives.'}
                  </small>
                  <span className="pay sm">
                    <span className="pill dk">Cash</span>
                  </span>
                </span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={payment === 'online'}
                className={payment === 'online' ? 'ocard big on' : 'ocard big'}
                onClick={() => setPayment('online')}
                disabled={!commerce.onlineEnabled}
              >
                <span className="radio" />
                <span className="oc-t">
                  <b>
                    Pay online {!commerce.onlineEnabled ? <span className="soon">Soon</span> : null}
                  </b>
                  <small>{commerce.onlineEnabled ? 'bKash, Nagad and cards via SSLCommerz.' : 'Online payment is coming soon.'}</small>
                  <span className="pay sm">
                    {commerce.onlineLabels.map((x) => (
                      <span key={x} className="pill dk">
                        {x}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            </div>
            {payment === 'online' || advance ? (
              <p className="note">
                <Icon name="lock" small />
                You&apos;ll go to SSLCommerz&apos;s secure page to pay, then come straight back here.
              </p>
            ) : null}
          </section>

          <section className="co-s last">
            <label className="chk">
              <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} />
              <span>
                <b>Keep me posted.</b> New drops and members-only deals by email (needs your email above). No spam.
              </span>
            </label>
          </section>

          <div className="place hide-d">
            <div className="sum-r big">
              <span>Total</span>
              <b>{taka(total)}</b>
            </div>
            <button className={`btn lg full${placing ? ' is-loading' : ''}`} type="submit" aria-busy={placing}>
              {placing ? <span className="spin" aria-hidden="true" /> : null}
              {placing ? 'Placing your order' : placeLabel}
            </button>
            {terms}
          </div>
        </form>

        <aside className="sumc sticky show-d" aria-label="Order summary">
          <h2>Order summary</h2>
          {summaryLines}
          <div className="sum-r big">
            <span>Total</span>
            <b>{taka(total)}</b>
          </div>
          <button className={`btn lg full${placing ? ' is-loading' : ''}`} type="button" onClick={place} aria-busy={placing}>
            {placing ? <span className="spin" aria-hidden="true" /> : null}
            {placing ? 'Placing your order' : placeLabel}
          </button>
          {terms}
          {commerce.exchangeDays ? (
            <p className="muted sm">
              <Icon name="exchange" small /> Easy {commerce.exchangeDays}-day exchange on every item.
            </p>
          ) : null}
        </aside>
      </div>
    </>
  )
}
