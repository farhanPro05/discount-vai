'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { Icon } from '../../../components/ui/Icon'

/** Friendly error page (no framework error screens for shoppers). */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div className="wrap narrow res">
      <span className="res-ic bad">
        <Icon name="alert" />
      </span>
      <h1>Something went wrong, vai</h1>
      <p className="res-sub">That&apos;s on us. Please try again; if it keeps happening, message us and we&apos;ll sort it out.</p>
      <div className="empty-a">
        <button className="btn lg" type="button" onClick={reset}>
          Try again
        </button>
        <Link className="btn-o" href="/">
          Go to homepage
        </Link>
      </div>
      {error.digest ? <p className="fine">Reference: {error.digest}</p> : null}
    </div>
  )
}
