'use client'

import { useId, useState } from 'react'

import { Icon } from './Icon'

export type AccItem = { title: string; body: React.ReactNode; key?: string }

/** Expand/collapse list (FAQ, product details). One open at a time. */
export function Accordion({ items, defaultOpen = 0, className = '' }: { items: AccItem[]; defaultOpen?: number | null; className?: string }) {
  const [open, setOpen] = useState<number | null>(defaultOpen)
  const id = useId()
  return (
    <div className={className}>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div className="acc" key={it.key ?? it.title}>
            <button
              className="acc-h"
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${id}-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              {it.title}
              <Icon name={isOpen ? 'minus' : 'plus'} small />
            </button>
            <div className="acc-b" id={`${id}-${i}`} hidden={!isOpen}>
              {it.body}
            </div>
          </div>
        )
      })}
    </div>
  )
}
