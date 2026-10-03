'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

import { taka } from '../../lib/format'
import type { CardProduct } from '../../lib/types'
import { Sil } from '../ui/Art'

const SHOT_CLASS = ['', 'shot-1', 'shot-2']

/** Option D product card: 4:5 photo that swipes (touch) or follows the pointer (desktop) through 3 shots. */
export function ProductCard({
  p,
  sizes = '(min-width: 1024px) 320px, (min-width: 768px) 30vw, 46vw',
  priority = false,
}: {
  p: CardProduct
  sizes?: string
  priority?: boolean
}) {
  const colour = p.colours[0]
  const photos = colour?.images.length ? colour.images : null
  const count = photos ? photos.length : 3
  const [idx, setIdx] = useState(0)
  const track = useRef<HTMLDivElement>(null)

  const go = (i: number, smooth = false) => {
    const el = track.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
    setIdx(i)
  }
  const onScroll = () => {
    const el = track.current
    if (!el || !el.clientWidth) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== idx) setIdx(i)
  }

  const badges: { label: string; cls: string }[] = []
  if (p.out) badges.push({ label: 'SOLD OUT', cls: 'b b-out' })
  else {
    if (p.onSale && p.discount > 0) badges.push({ label: `-${p.discount}%`, cls: 'b b-sale' })
    if (p.isNew) badges.push({ label: 'NEW', cls: 'b b-new' })
  }

  return (
    <div className={`cd${p.out ? ' is-out' : ''}`}>
      <Link
        className="phl"
        href={p.href}
        aria-label={`${p.name}, ${colour?.name ?? ''}, ${taka(p.price)}${p.out ? ', sold out' : ''}`}
        onMouseLeave={() => idx && go(0)}
      >
        <div className="ph">
          <div className="ph-track" ref={track} onScroll={onScroll}>
            {Array.from({ length: count }, (_, i) => (
              <div className="ph-slide" key={i}>
                {photos ? (
                  <Image
                    src={photos[i].url}
                    alt={i === 0 ? photos[i].alt : ''}
                    fill
                    sizes={sizes}
                    priority={priority && i === 0}
                    loading={priority && i === 0 ? undefined : 'lazy'}
                  />
                ) : (
                  <Sil shape={p.shape} fill={colour?.hex} className={`sil ${SHOT_CLASS[i] ?? ''}`} />
                )}
              </div>
            ))}
          </div>
          {badges.length ? (
            <div className="bdg">
              {badges.map((b) => (
                <span key={b.label} className={b.cls}>
                  {b.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {count > 1 ? (
          <span className="zones" aria-hidden="true">
            {Array.from({ length: count }, (_, i) => (
              <span key={i} className="zone" onMouseEnter={() => idx !== i && go(i)} />
            ))}
          </span>
        ) : null}
      </Link>
      {count > 1 ? (
        <div className="bars">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              className={i === idx ? 'bar on' : 'bar'}
              aria-label={`Show photo ${i + 1} of ${count} of ${p.name}`}
              onClick={() => go(i, true)}
            />
          ))}
        </div>
      ) : (
        <div className="bars" aria-hidden="true" />
      )}
      <Link className="meta" href={p.href} tabIndex={-1}>
        <span className="nm">{p.name}</span>
        <span className="pr">
          <span className={p.onSale ? 'now sale' : 'now'}>{taka(p.price)}</span>
          {p.onSale ? <s className="was">{taka(p.was)}</s> : null}
        </span>
        <span className="cl">
          <span className="sws">
            {p.colours.slice(0, 5).map((c) => (
              <span key={c.name} className="sw" style={{ background: c.hex }} title={c.name} />
            ))}
          </span>
          <span>{colour?.name}</span>
        </span>
      </Link>
    </div>
  )
}
