import Link from 'next/link'

import { Icon } from '../ui/Icon'

/** "Lost, vai?" 404 content (used by the site's not-found page and the global 404). */
export function NotFoundBody({ links }: { links: { label: string; href: string }[] }) {
  return (
    <div className="wrap narrow res">
      <p className="big404" aria-hidden="true">
        404
      </p>
      <h1>Lost, vai?</h1>
      <p className="res-sub">This page has wandered off. Let&apos;s get you back to the good stuff.</p>
      <form className="field-s big" action="/search" role="search">
        <Icon name="search" />
        <input type="search" name="q" placeholder="Search Panjabi, shorts, bags" aria-label="Search" />
      </form>
      <div className="chip-row center">
        {links.map((c) => (
          <Link key={c.href} className="chip" href={c.href}>
            {c.label}
          </Link>
        ))}
      </div>
      <Link className="btn lg" href="/">
        Go to homepage
      </Link>
    </div>
  )
}

export const DEFAULT_404_LINKS = [
  { label: 'Men', href: '/men' },
  { label: 'Panjabi', href: '/men/panjabi' },
  { label: 'Bags', href: '/accessories/bags' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Sale', href: '/sale' },
]
