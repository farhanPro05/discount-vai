'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const two = (n: number) => String(Math.max(0, n)).padStart(2, '0')

/** "Vai's Deals of the Week" with a live countdown. Hides itself when the deal ends. */
export function DealBanner({
  eyebrow,
  heading,
  text,
  endsAt,
  ctaLabel,
  ctaLink,
}: {
  eyebrow?: string | null
  heading: string
  text?: string | null
  endsAt?: string | null
  ctaLabel?: string | null
  ctaLink?: string | null
}) {
  const end = endsAt ? new Date(endsAt).getTime() : null
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (!end) return
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const t = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(t)
    }
  }, [end])

  if (end && now && now >= end) return null
  const left = end && now ? Math.floor((end - now) / 1000) : null
  const units = left != null
    ? [
        { v: two(Math.floor(left / 86400)), l: 'Days' },
        { v: two(Math.floor((left % 86400) / 3600)), l: 'Hours' },
        { v: two(Math.floor((left % 3600) / 60)), l: 'Mins' },
        { v: two(left % 60), l: 'Secs' },
      ]
    : end
      ? ['Days', 'Hours', 'Mins', 'Secs'].map((l) => ({ v: '--', l }))
      : null

  return (
    <section className="sec sec-t" aria-label={heading}>
      <div className="wrap">
        <div className="deal">
          <div className="deal-t">
            {eyebrow ? <span className="eb">{eyebrow}</span> : null}
            <h2>{heading}</h2>
            {text ? <p>{text}</p> : null}
          </div>
          {units ? (
            <div className="cdown" role="timer" aria-label="Time left on this deal">
              {units.map((u) => (
                <span className="cd-u" key={u.l}>
                  <b>{u.v}</b>
                  <span>{u.l}</span>
                </span>
              ))}
            </div>
          ) : null}
          {ctaLink ? (
            <Link className="btn-inv lg" href={ctaLink}>
              {ctaLabel || 'Shop the deals'}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
