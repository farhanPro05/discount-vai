'use client'

import Image from 'next/image'
import Link from 'next/link'

import { taka } from '../../lib/format'
import type { CartLine } from '../../lib/types'
import { Sil } from '../ui/Art'
import { Icon } from '../ui/Icon'
import { MAX_QTY, useShop } from './ShopProvider'

export function LineThumb({ line, small, qty }: { line: CartLine; small?: boolean; qty?: number }) {
  return (
    <span className={`l-th${small ? ' sm' : ''}`}>
      <span>
        {line.image ? <Image src={line.image.url} alt="" fill sizes={small ? '52px' : '96px'} /> : <Sil shape={line.shape} fill={line.hex} className="" />}
      </span>
      {qty ? <i>{qty}</i> : null}
    </span>
  )
}

export function Qty({ line, small = true }: { line: CartLine; small?: boolean }) {
  const { setQty } = useShop()
  return (
    <div className={`qty${small ? ' sm' : ''}`} role="group" aria-label={`Quantity of ${line.name}`}>
      <button type="button" aria-label="Decrease quantity" onClick={() => setQty(line.key, line.qty - 1)} disabled={line.qty <= 1}>
        <Icon name="minus" small />
      </button>
      <span aria-live="polite">{line.qty}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => setQty(line.key, line.qty + 1)} disabled={line.qty >= MAX_QTY}>
        <Icon name="plus" small />
      </button>
    </div>
  )
}

export function FreeDelivery({ subtotal, freeOver, box }: { subtotal: number; freeOver: number | null; box?: boolean }) {
  if (!freeOver) return null
  const need = Math.max(0, freeOver - subtotal)
  return (
    <div className={`fdp${box ? ' box' : ''}`}>
      <p>{need > 0 ? `Add ${taka(need)} more for free delivery` : 'Nice, vai. Delivery is on us.'}</p>
      <div className="fdp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round((subtotal / freeOver) * 100))}>
        <span style={{ width: `${Math.min(100, Math.round((subtotal / freeOver) * 100))}%` }} />
      </div>
    </div>
  )
}

/** Slide-in cart from the right. */
export function CartDrawer({ freeOver }: { freeOver: number | null }) {
  const { drawerOpen, closeDrawer, lines, count, subtotal, remove } = useShop()
  if (!drawerOpen) return null
  return (
    <>
      <button className="scrim" type="button" aria-label="Close cart" onClick={closeDrawer} />
      <aside className="cdrawer" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="cd-h">
          <h2>
            Your cart <span className="muted">({count})</span>
          </h2>
          <button className="ib" type="button" aria-label="Close cart" onClick={closeDrawer} autoFocus>
            <Icon name="x" />
          </button>
        </div>
        {lines.length ? (
          <>
            <FreeDelivery subtotal={subtotal} freeOver={freeOver} />
            <div className="cd-items">
              {lines.map((l) => (
                <div className="line" key={l.key}>
                  <LineThumb line={l} />
                  <div className="l-b">
                    <Link className="l-n" href={`/products/${l.slug}`} onClick={closeDrawer}>
                      {l.name}
                    </Link>
                    <span className="muted">
                      {l.colour} · Size {l.size}
                    </span>
                    <span className="pr">
                      <span className={l.was > l.price ? 'now sale' : 'now'}>{taka(l.price)}</span>
                      {l.was > l.price ? <s className="was">{taka(l.was)}</s> : null}
                    </span>
                    <div className="l-a">
                      <Qty line={l} />
                      <button className="lnk muted-l" type="button" onClick={() => remove(l.key)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cd-f">
              <div className="sum-r big">
                <span>Subtotal</span>
                <b>{taka(subtotal)}</b>
              </div>
              <p className="muted sm">Delivery and discount codes are added at checkout.</p>
              <Link className="btn lg full" href="/checkout" onClick={closeDrawer}>
                Checkout · {taka(subtotal)}
              </Link>
              <Link className="btn-o full" href="/cart" onClick={closeDrawer}>
                View cart
              </Link>
            </div>
          </>
        ) : (
          <div className="empty sm">
            <span className="empty-ic">
              <Icon name="bag" />
            </span>
            <h2>Your cart is empty</h2>
            <Link className="btn" href="/men" onClick={closeDrawer}>
              Shop Men
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}

/** "Added to cart" confirmation. */
export function CartToast() {
  const { toast, hideToast, openDrawer } = useShop()
  if (!toast) return null
  const l = toast.line
  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="t-ok">
        <Icon name="check" />
      </span>
      <span className="t-th">
        {l.image ? <Image src={l.image.url} alt="" fill sizes="44px" /> : <Sil shape={l.shape} fill={l.hex} className="" />}
      </span>
      <span className="t-t">
        <b>Added to cart</b>
        <small>
          {l.name} · {l.colour} · {l.size} · Qty {l.qty}
        </small>
      </span>
      <button className="lnk" type="button" onClick={openDrawer}>
        View cart
      </button>
      <button className="ib sm" type="button" aria-label="Dismiss" onClick={hideToast}>
        <Icon name="x" small />
      </button>
    </div>
  )
}

/** Floating chat button. Falls back to the Contact page until a WhatsApp number is set. */
export function WhatsAppButton({ href }: { href: string }) {
  const external = href.startsWith('http')
  return (
    <a
      className="wa"
      href={href}
      aria-label={external ? 'Chat with us on WhatsApp' : 'Contact us'}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <Icon name="whatsapp" />
    </a>
  )
}
