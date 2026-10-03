'use client'

import { useEffect, useState } from 'react'

import { Icon } from '../ui/Icon'

/** Thin bar at the very top. Rotates through the admin's messages. */
export function AnnouncementBar({ messages }: { messages: string[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = messages.length

  useEffect(() => {
    if (n < 2 || paused) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000)
    return () => clearInterval(t)
  }, [n, paused])

  if (!n) return null
  return (
    <div className="ann" role="region" aria-label="Announcements" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {n > 1 ? (
        <button className="ann-b" type="button" aria-label="Previous message" onClick={() => setI((x) => (x + n - 1) % n)}>
          <Icon name="chevLeft" small />
        </button>
      ) : (
        <span style={{ width: 36, flex: 'none' }} />
      )}
      <span aria-live="polite">{messages[i]}</span>
      {n > 1 ? (
        <button className="ann-b" type="button" aria-label="Next message" onClick={() => setI((x) => (x + 1) % n)}>
          <Icon name="chevRight" small />
        </button>
      ) : (
        <span style={{ width: 36, flex: 'none' }} />
      )}
    </div>
  )
}
