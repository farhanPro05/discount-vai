'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { CardProduct } from '../../lib/types'
import { Icon } from '../ui/Icon'
import { ProductCard } from './ProductCard'

/** Section heading + a row of product cards where the next card peeks in; arrows on desktop, swipe on touch. */
export function Carousel({
  title,
  items,
  link,
  linkLabel = 'View all',
  headingLevel = 'h2',
}: {
  title: string
  items: CardProduct[]
  link?: string | null
  linkLabel?: string
  headingLevel?: 'h2' | 'h3'
}) {
  const track = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const update = useCallback(() => {
    const el = track.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  const step = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const w = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * w, behavior: 'smooth' })
  }

  if (!items.length) return null
  const H = headingLevel
  return (
    <>
      <div className="sh-d">
        <H>{title}</H>
        <div className="r">
          {link ? (
            <Link className="lnk" href={link}>
              {linkLabel}
            </Link>
          ) : null}
          <div className="arws">
            <button className="arw" type="button" aria-label={`Previous: ${title}`} onClick={() => step(-1)} disabled={atStart}>
              <Icon name="chevLeft" />
            </button>
            <button className="arw" type="button" aria-label={`Next: ${title}`} onClick={() => step(1)} disabled={atEnd}>
              <Icon name="chevRight" />
            </button>
          </div>
        </div>
      </div>
      <div className="car">
        <div className="trk" ref={track} onScroll={update} role="list" aria-label={title}>
          {items.map((p) => (
            <div key={p.id} role="listitem">
              <ProductCard p={p} sizes="(min-width: 1024px) 300px, (min-width: 768px) 260px, 158px" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
