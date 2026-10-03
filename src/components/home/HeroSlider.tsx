'use client'

import { getImageProps } from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { SHAPES, type ShapeKey } from '../../fields/shapes'
import type { Img } from '../../lib/types'
import { Icon } from '../ui/Icon'

export type Slide = {
  eyebrow?: string | null
  heading: string
  text?: string | null
  ctaLabel?: string | null
  ctaLink?: string | null
  desktop: Img | null
  mobile: Img | null
}

const PLACEHOLDER_SHAPES: [ShapeKey, ShapeKey][] = [
  ['panjabi', 'panjabi'],
  ['shorts', 'tee'],
  ['jacket', 'backpack'],
]

/** Desktop and mobile crops of the same slide (art direction). */
function SlideImage({ desktop, mobile, priority }: { desktop: Img | null; mobile: Img | null; priority: boolean }) {
  const main = desktop ?? mobile
  if (!main) return null
  const common = { alt: main.alt, fill: true, priority, sizes: '100vw', style: { objectFit: 'cover' as const } }
  const d = getImageProps({ ...common, src: main.url }).props
  const m = mobile ? getImageProps({ ...common, src: mobile.url }).props : null
  return (
    <picture>
      {m ? <source media="(max-width: 767px)" srcSet={m.srcSet} sizes="100vw" /> : null}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...d} />
    </picture>
  )
}

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = slides.length

  useEffect(() => {
    if (n < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => setI((x) => (x + 1) % n), 6500)
    return () => clearTimeout(t)
  }, [i, n, paused])

  if (!n) return null
  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero-sl ls" style={{ position: 'relative' }}>
        {slides.map((s, k) => {
          const shapes = PLACEHOLDER_SHAPES[k % PLACEHOLDER_SHAPES.length]
          const hasImg = !!(s.desktop || s.mobile)
          const H = k === 0 ? 'h1' : 'h2'
          return (
            <div
              key={k}
              className={`hero-slide ls hs-${k % 3}${k === i ? ' on' : ''}${hasImg ? ' has-img' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${k + 1} of ${n}`}
              aria-hidden={k !== i}
            >
              {hasImg ? (
                <SlideImage desktop={s.desktop} mobile={s.mobile} priority={k === 0} />
              ) : (
                <>
                  <svg className="ls-fig" viewBox="0 0 100 125" aria-hidden="true">
                    <path d={SHAPES[shapes[0]]} fillRule="evenodd" />
                  </svg>
                  <svg className="ls-fig f2" viewBox="0 0 100 125" aria-hidden="true">
                    <path d={SHAPES[shapes[1]]} fillRule="evenodd" />
                  </svg>
                </>
              )}
              <div className="wrap hero-in">
                <div className="hero-t">
                  {s.eyebrow ? <span className="eb">{s.eyebrow}</span> : null}
                  <H>{s.heading}</H>
                  {s.text ? <p>{s.text}</p> : null}
                  {s.ctaLink ? (
                    <Link className="btn lg" href={s.ctaLink} tabIndex={k === i ? 0 : -1}>
                      {s.ctaLabel || 'Shop now'}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
        {n > 1 ? (
          <>
            <button className="arw hero-prev show-d" type="button" aria-label="Previous slide" onClick={() => setI((x) => (x + n - 1) % n)}>
              <Icon name="chevLeft" />
            </button>
            <button className="arw hero-next show-d" type="button" aria-label="Next slide" onClick={() => setI((x) => (x + 1) % n)}>
              <Icon name="chevRight" />
            </button>
            <div className="dots">
              {slides.map((_, k) => (
                <button
                  key={k}
                  type="button"
                  className={k === i ? 'dot on' : 'dot'}
                  aria-label={`Show slide ${k + 1}`}
                  aria-current={k === i}
                  onClick={() => setI(k)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
