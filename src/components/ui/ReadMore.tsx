'use client'

import { useState } from 'react'

/** Shows extra text on demand. The text is always in the page (Google reads it), just hidden until opened. */
export function ReadMore({ more, className = '', inline = false }: { more: string; className?: string; inline?: boolean }) {
  const [open, setOpen] = useState(false)
  const button = (
    <button className="lnk" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
      {open ? 'Read less' : 'Read more'}
    </button>
  )
  if (inline) {
    return (
      <>
        <span hidden={!open}>{more}</span> {button}
      </>
    )
  }
  return (
    <>
      <p className={className} hidden={!open}>
        {more}
      </p>
      {button}
    </>
  )
}
