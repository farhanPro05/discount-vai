'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { freshCardsAction } from '../../app/(frontend)/actions'
import type { ShapeKey } from '../../fields/shapes'
import { taka } from '../../lib/format'
import type { CardProduct, Img } from '../../lib/types'
import { useEscape, useShop } from '../shop/ShopProvider'
import { useStoredJSON } from '../shop/storage'
import { Sil } from '../ui/Art'
import { Accordion } from '../ui/Accordion'
import { Icon } from '../ui/Icon'
import { ProductCard } from './ProductCard'
import { SizeGuideModal, type SizeGuideData } from './SizeGuideModal'

export type PDColour = { name: string; hex: string; images: Img[]; sizes: { size: string; stock: number }[] }

export type PD = {
  id: number
  slug: string
  name: string
  kicker?: string | null
  category: string
  price: number
  was: number
  onSale: boolean
  discount: number
  isNew: boolean
  shape: ShapeKey
  colours: PDColour[]
  description?: string | null
  details: { label: string; value: string }[]
  guide: SizeGuideData | null
  initialColour: number
  delivery: { insideFee: number; insideEta: string; outsideFee: number; outsideEta: string; freeOver: number | null; exchangeDays: number }
  payments: string
  shareUrl: string
}

const SHOTS = ['', 'shot-1', 'shot-2', 'shot-3']
const LOW = 3

function rememberViewed(card: CardProduct) {
  try {
    const list = JSON.parse(window.localStorage.getItem('dv-recent') || '[]') as CardProduct[]
    const next = [card, ...list.filter((c) => c.href !== card.href)].slice(0, 9)
    window.localStorage.setItem('dv-recent', JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function ProductDetail({ p, card }: { p: PD; card: CardProduct }) {
  const { add } = useShop()
  const router = useRouter()
  const [ci, setCi] = useState(p.initialColour)
  const [gi, setGi] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [needSize, setNeedSize] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [copied, setCopied] = useState(false)
  const track = useRef<HTMLDivElement>(null)
  const sizesRef = useRef<HTMLDivElement>(null)
  useEscape(zoom, () => setZoom(false))

  const colour = p.colours[ci] ?? p.colours[0]
  const photos = colour.images
  const views = photos.length ? photos.length : 4
  const oneSize = colour.sizes.length === 1 && /one size/i.test(colour.sizes[0].size)
  const chosen = oneSize ? colour.sizes[0].size : size
  const stock = colour.sizes.find((s) => s.size === chosen)?.stock ?? 0
  const allOut = colour.sizes.every((s) => s.stock <= 0)
  const colourOut = (c: PDColour) => c.sizes.every((s) => s.stock <= 0)
  const productOut = p.colours.every(colourOut)

  useEffect(() => rememberViewed(card), [card])
  // Room for the sticky mobile "Add to Cart" bar.
  useEffect(() => {
    document.body.classList.add('has-satc')
    return () => document.body.classList.remove('has-satc')
  }, [])

  // Keep the colour in the address bar so it can be shared.
  const pickColour = (i: number) => {
    setCi(i)
    setGi(0)
    track.current?.scrollTo({ left: 0 })
    const c = p.colours[i]
    if (size && !c.sizes.some((s) => s.size === size && s.stock > 0)) setSize(null)
    const url = new URL(window.location.href)
    if (i === 0) url.searchParams.delete('colour')
    else url.searchParams.set('colour', c.name)
    window.history.replaceState(null, '', url.toString())
  }

  const showPhoto = (i: number) => {
    setGi(i)
    const el = track.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  const addToCart = (thenCheckout = false) => {
    if (!chosen) {
      setNeedSize(true)
      sizesRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    if (stock <= 0) return
    add(
      {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        colour: colour.name,
        size: chosen,
        qty: Math.min(qty, stock),
        price: p.price,
        was: p.was,
        image: photos[0] ?? null,
        shape: p.shape,
        hex: colour.hex,
      },
      stock,
    )
    if (thenCheckout) router.push('/checkout')
  }

  const photo = (i: number, sizes: string, priority = false) =>
    photos[i] ? (
      <Image src={photos[i].url} alt={photos[i].alt} fill sizes={sizes} priority={priority} />
    ) : (
      <Sil shape={p.shape} fill={colour.hex} className={`sil ${SHOTS[i] ?? ''}`} />
    )

  const badge = productOut ? (
    <span className="b b-out">SOLD OUT</span>
  ) : p.onSale && p.discount > 0 ? (
    <span className="b b-sale">-{p.discount}%</span>
  ) : p.isNew ? (
    <span className="b b-new">NEW</span>
  ) : null
  const share = encodeURIComponent(p.shareUrl)

  return (
    <>
      <div className="pdp">
        <div className="gal">
          <div className="thumbs show-d">
            {Array.from({ length: views }, (_, i) => (
              <button
                key={i}
                type="button"
                className={i === gi ? 'thumb on' : 'thumb'}
                aria-label={`Show photo ${i + 1} of ${views}`}
                aria-pressed={i === gi}
                onClick={() => setGi(i)}
              >
                <span className="ph">{photo(i, '88px')}</span>
              </button>
            ))}
          </div>
          <div className="gal-main show-d">
            <button type="button" className="ph" style={{ width: '100%' }} aria-label="Zoom photo" onClick={() => photos.length && setZoom(true)}>
              {photo(gi, '(min-width: 1024px) 50vw, 100vw', true)}
              {badge ? <span className="bdg">{badge}</span> : null}
            </button>
          </div>
          <div className="hide-d">
            <div className="gal-car">
              <div
                className="gal-trk"
                ref={track}
                onScroll={(e) => {
                  const el = e.currentTarget
                  const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth))
                  if (i !== gi) setGi(i)
                }}
              >
                {Array.from({ length: views }, (_, i) => (
                  <div className="ph" key={i}>
                    {/* Hidden on desktop: tiny size there, so desktop doesn't download a second full-width copy. */}
                    {photo(i, '(min-width: 1024px) 1px, 100vw', i === 0)}
                  </div>
                ))}
              </div>
              {badge ? <span className="bdg">{badge}</span> : null}
              <span className="gal-n">
                {gi + 1} / {views}
              </span>
            </div>
            <div className="dots dark">
              {Array.from({ length: views }, (_, i) => (
                <button key={i} type="button" className={i === gi ? 'dot on' : 'dot'} aria-label={`Show photo ${i + 1}`} onClick={() => showPhoto(i)} />
              ))}
            </div>
          </div>
        </div>

        <div className="info">
          {p.kicker ? <p className="kick">{p.kicker}</p> : null}
          <h1>{p.name}</h1>
          <div className="pp">
            <span className={p.onSale ? 'now sale' : 'now'}>{taka(p.price)}</span>
            {p.onSale ? (
              <>
                <s className="was">{taka(p.was)}</s>
                <span className="b b-sale">-{p.discount}%</span>
              </>
            ) : null}
            {productOut ? <span className="b b-out">Sold out</span> : null}
          </div>
          {p.onSale ? <p className="save">You save {taka(p.was - p.price)}</p> : null}

          <div className="po">
            <p className="opt-l">
              Colour: <b>{colour.name}</b>
            </p>
            <div className="swatches" role="radiogroup" aria-label="Colour">
              {p.colours.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  role="radio"
                  aria-checked={i === ci}
                  aria-label={colourOut(c) ? `${c.name}, sold out` : c.name}
                  title={colourOut(c) ? `${c.name} (sold out)` : c.name}
                  className={`swb${i === ci ? ' on' : ''}${colourOut(c) ? ' out' : ''}`}
                  onClick={() => pickColour(i)}
                >
                  <span style={{ background: c.hex }} />
                </button>
              ))}
            </div>
          </div>

          {!oneSize ? (
            <div className="po" ref={sizesRef}>
              <div className="opt-row">
                <p className="opt-l">
                  Size: <b>{chosen ?? (allOut ? 'sold out' : 'choose one')}</b>
                </p>
                {p.guide ? (
                  <button className="lnk ic-lnk" type="button" onClick={() => setGuideOpen(true)}>
                    <Icon name="ruler" small />
                    Size Guide
                  </button>
                ) : null}
              </div>
              <div className="sizes" role="radiogroup" aria-label="Size">
                {colour.sizes.map((s) => {
                  const out = s.stock <= 0
                  return (
                    <button
                      key={s.size}
                      type="button"
                      role="radio"
                      aria-checked={s.size === size}
                      aria-disabled={out}
                      aria-label={out ? `${s.size}, out of stock` : s.size}
                      className={out ? 'sz out' : s.size === size ? 'sz on' : 'sz'}
                      onClick={() => {
                        if (out) return
                        setSize(s.size)
                        setNeedSize(false)
                        setQty((q) => Math.min(q, s.stock))
                      }}
                    >
                      {s.size}
                    </button>
                  )
                })}
              </div>
              {needSize ? (
                <p className="err" role="alert">
                  <Icon name="alert" small />
                  Choose a size first.
                </p>
              ) : null}
            </div>
          ) : null}

          {allOut ? (
            <p className="low bad">
              <span className="dotw" aria-hidden="true" />
              {productOut ? 'Sold out. Check back soon.' : `Sold out in ${colour.name}. Other colours are still in stock.`}
            </p>
          ) : chosen && stock > 0 && stock <= LOW ? (
            <p className="low">
              <span className="dotw" aria-hidden="true" />
              Only {stock} left{oneSize ? '' : ` in ${chosen}`}. Order soon.
            </p>
          ) : null}

          <div className="buy">
            <div className="qty" role="group" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>
                <Icon name="minus" small />
              </button>
              <span aria-live="polite">{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(chosen ? Math.max(1, stock) : 9, 9, qty + 1))} disabled={qty >= 9 || (!!chosen && qty >= stock)}>
                <Icon name="plus" small />
              </button>
            </div>
            <button className="btn lg grow" type="button" onClick={() => addToCart()} disabled={allOut}>
              {allOut ? 'Sold out' : 'Add to Cart'}
            </button>
          </div>
          <button className="btn-dark lg full" type="button" onClick={() => addToCart(true)} disabled={allOut}>
            Buy Now
          </button>

          <div className="ship">
            <p>
              <Icon name="truck" />
              <span>
                <b>Inside Dhaka</b> {taka(p.delivery.insideFee)}, {p.delivery.insideEta} · <b>Outside Dhaka</b> {taka(p.delivery.outsideFee)}, {p.delivery.outsideEta}
                {p.delivery.freeOver ? ` · Free over ${taka(p.delivery.freeOver)}` : ''}
              </span>
            </p>
            {p.delivery.exchangeDays ? (
              <p>
                <Icon name="exchange" />
                <span>
                  <b>Easy {p.delivery.exchangeDays}-day exchange.</b> Wrong size? We pick it up and swap it.
                </span>
              </p>
            ) : null}
            <p>
              <Icon name="cash" />
              <span>{p.payments}</span>
            </p>
          </div>

          <Accordion
            className="accs"
            items={[
              ...(p.description ? [{ title: 'Description', body: <p>{p.description}</p> }] : []),
              ...(p.details.length
                ? [
                    {
                      title: 'Details',
                      body: (
                        <dl className="spec">
                          {p.details.map((d) => (
                            <div key={d.label} style={{ display: 'contents' }}>
                              <dt>{d.label}</dt>
                              <dd>{d.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ),
                    },
                  ]
                : []),
              {
                title: 'Delivery & Exchange',
                body: (
                  <p>
                    Inside Dhaka {taka(p.delivery.insideFee)} ({p.delivery.insideEta}). Outside Dhaka {taka(p.delivery.outsideFee)} ({p.delivery.outsideEta}).
                    {p.delivery.freeOver ? ` Free delivery on orders over ${taka(p.delivery.freeOver)}.` : ''}
                    {p.delivery.exchangeDays ? ` Exchange unworn items within ${p.delivery.exchangeDays} days; we collect from your door.` : ''}
                  </p>
                ),
              },
            ]}
          />

          <div className="share">
            <span className="muted">Share</span>
            <a className="ib bd" href={`https://www.facebook.com/sharer/sharer.php?u=${share}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
              <Icon name="facebook" />
            </a>
            <a className="ib bd" href={`https://wa.me/?text=${encodeURIComponent(`${p.name} ${p.shareUrl}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
              <Icon name="whatsapp" />
            </a>
            <button
              className="ib bd"
              type="button"
              aria-label="Copy link"
              onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => setCopied(true), () => null)}
            >
              <Icon name="link" />
            </button>
            {copied ? (
              <span className="muted" role="status">
                Link copied
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="satc">
        <div className="satc-p">
          <span className={p.onSale ? 'now sale' : 'now'}>{taka(p.price)}</span>
          {p.onSale ? <s className="was">{taka(p.was)}</s> : null}
        </div>
        <button className="btn lg grow" type="button" onClick={() => addToCart()} disabled={allOut}>
          {allOut ? 'Sold out' : `Add to Cart${chosen && !oneSize ? ` · ${chosen}` : ''}`}
        </button>
      </div>

      {guideOpen && p.guide ? <SizeGuideModal guide={p.guide} selected={chosen} shape={p.shape} onClose={() => setGuideOpen(false)} /> : null}
      {zoom && photos[gi] ? (
        <>
          <button className="scrim" type="button" aria-label="Close zoom" onClick={() => setZoom(false)} />
          <div className="modal" role="dialog" aria-modal="true" aria-label="Photo" style={{ width: 'min(92vw, 900px)', padding: 0 }}>
            <div className="sheet-h">
              <h2>{p.name}</h2>
              <button className="ib" type="button" aria-label="Close" onClick={() => setZoom(false)} autoFocus>
                <Icon name="x" />
              </button>
            </div>
            <div style={{ position: 'relative', aspectRatio: '4 / 5', background: 'var(--sunk)' }}>
              <Image src={photos[gi].url} alt={photos[gi].alt} fill sizes="900px" style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}

/** "Recently viewed" from this browser (stored locally, never sent anywhere). */
const NONE: CardProduct[] = []

export function RecentlyViewed({ current }: { current: string }) {
  const list = useStoredJSON<CardProduct[]>('dv-recent', NONE)
  // Matched by link, so entries stay correct even if a product is re-created with a new id.
  const saved = Array.isArray(list) ? list.filter((c, i) => c.href !== current && list.findIndex((o) => o.href === c.href) === i).slice(0, 4) : NONE
  // The saved cards can be days old: show them at once, then swap in current prices and stock.
  const key = saved.map((c) => c.slug).join(',')
  const [fresh, setFresh] = useState<{ key: string; cards: CardProduct[] } | null>(null)
  useEffect(() => {
    if (!key) return
    let live = true
    freshCardsAction(key.split(','))
      .then((cards) => live && setFresh({ key, cards }))
      .catch(() => null)
    return () => {
      live = false
    }
  }, [key])
  const items = fresh?.key === key ? fresh.cards : saved
  if (!items.length) return null
  return (
    <section className="sec sec-t" aria-labelledby="h-recent">
      <div className="sh-d">
        <h2 id="h-recent">Recently viewed</h2>
      </div>
      <div className="ga bs rv2">
        {items.map((c) => (
          <ProductCard key={c.id} p={c} />
        ))}
      </div>
    </section>
  )
}
