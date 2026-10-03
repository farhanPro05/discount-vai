'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'

import { checkCodeAction } from '../../app/(frontend)/actions'
import { taka } from '../../lib/format'
import type { CardProduct } from '../../lib/types'
import { ProductCard } from '../product/ProductCard'
import { Icon } from '../ui/Icon'
import { FreeDelivery, LineThumb, Qty } from './CartBits'
import { useShop } from './ShopProvider'
import { useCartSync } from './useCartSync'

export const CODE_KEY = 'dv-code'

export function CartView({ insideFee, freeOver, picks, payLabels }: { insideFee: number; freeOver: number | null; picks: CardProduct[]; payLabels: string[] }) {
  const { lines, ready, count, subtotal, remove } = useShop()
  const { problems } = useCartSync()
  const [code, setCode] = useState('')
  useEffect(() => {
    try {
      setCode(window.sessionStorage.getItem(CODE_KEY) ?? '')
    } catch {
      /* ignore */
    }
  }, [])
  const [disc, setDisc] = useState<{ amount: number; code: string } | null>(null)
  const [codeMsg, setCodeMsg] = useState('')
  const [pending, start] = useTransition()

  const delivery = freeOver && subtotal >= freeOver ? 0 : insideFee
  const discount = disc ? Math.min(disc.amount, subtotal) : 0
  const apply = () =>
    start(async () => {
      const res = await checkCodeAction(code, lines.map((l) => ({ productId: l.productId, colour: l.colour, size: l.size, qty: l.qty })))
      if (res.ok) {
        setDisc({ amount: res.discount, code: res.code })
        setCodeMsg(`${res.code} applied: you save ${taka(res.discount)}.`)
        try {
          window.sessionStorage.setItem(CODE_KEY, res.code)
        } catch {
          /* ignore */
        }
      } else {
        setDisc(null)
        setCodeMsg(res.message)
      }
    })

  if (!ready) return <div className="empty" aria-busy="true" />

  if (!lines.length) {
    return (
      <>
        <div className="empty">
          <span className="empty-ic">
            <Icon name="bag" />
          </span>
          <h1 className="pg-h1">Your cart is empty, vai</h1>
          <p>Plenty of good stuff waiting. Start with these.</p>
          <div className="empty-a">
            <Link className="btn lg" href="/men">
              Shop Men
            </Link>
            <Link className="btn-o" href="/accessories/bags">
              Shop Bags
            </Link>
          </div>
        </div>
        {picks.length ? (
          <>
            <div className="sh-d">
              <h2>Vai&apos;s Picks</h2>
            </div>
            <div className="ga bs">
              {picks.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </>
        ) : null}
      </>
    )
  }

  return (
    <>
      <h1 className="pg-h1">
        Your cart <span className="muted">({count} {count === 1 ? 'item' : 'items'})</span>
      </h1>
      {problems.length ? (
        <div className="note bad" role="alert" style={{ marginBottom: 16 }}>
          <Icon name="alert" small />
          <span>{problems.join(' ')}</span>
        </div>
      ) : null}
      <div className="cart-l">
        <div>
          <FreeDelivery subtotal={subtotal} freeOver={freeOver} box />
          <div className="ct-head show-d">
            <span>Product</span>
            <span>Quantity</span>
            <span style={{ textAlign: 'right' }}>Total</span>
          </div>
          {lines.map((l) => (
            <div className="line big" key={l.key}>
              <LineThumb line={l} />
              <div className="l-b">
                <Link className="l-n" href={`/products/${l.slug}`}>
                  {l.name}
                </Link>
                <span className="muted">
                  {l.colour} · Size {l.size}
                </span>
                <span className="pr">
                  <span className={l.was > l.price ? 'now sale' : 'now'}>{taka(l.price)}</span>
                  {l.was > l.price ? <s className="was">{taka(l.was)}</s> : null}
                </span>
                <button className="lnk muted-l" type="button" onClick={() => remove(l.key)} style={{ alignSelf: 'flex-start' }}>
                  Remove
                </button>
              </div>
              <Qty line={l} />
              <b className="l-tot">{taka(l.price * l.qty)}</b>
            </div>
          ))}
          <Link className="lnk back" href="/men">
            Keep shopping
          </Link>
        </div>
        <aside className="sumc" aria-label="Order summary">
          <h2>Order summary</h2>
          <div className="sum-r">
            <span>Subtotal</span>
            <span>{taka(subtotal)}</span>
          </div>
          <div className="sum-r">
            <span>Delivery (Inside Dhaka)</span>
            <span>{delivery ? taka(delivery) : 'Free'}</span>
          </div>
          <label className="fld">
            <span className="fl">Discount code</span>
            <span className="fld-row">
              <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. VAI10" aria-label="Discount code" autoCapitalize="characters" />
              <button className="btn-o" type="button" onClick={apply} disabled={pending || !code.trim()}>
                {pending ? '…' : 'Apply'}
              </button>
            </span>
            {codeMsg ? <span className={`hint ${disc ? 'ok' : 'bad'}`}>{codeMsg}</span> : null}
          </label>
          {discount ? (
            <div className="sum-r ok">
              <span>Discount ({disc?.code})</span>
              <span>-{taka(discount)}</span>
            </div>
          ) : null}
          <div className="sum-r big">
            <span>Total</span>
            <b>{taka(subtotal - discount + delivery)}</b>
          </div>
          <Link className="btn lg full" href="/checkout">
            Checkout
          </Link>
          <div className="pay sm">
            {payLabels.map((p) => (
              <span key={p} className="pill dk">
                {p}
              </span>
            ))}
          </div>
          <p className="muted sm">
            <Icon name="lock" small /> Secure checkout. Outside Dhaka delivery is worked out at checkout.
          </p>
        </aside>
      </div>
    </>
  )
}
