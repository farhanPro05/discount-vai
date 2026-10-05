'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { loadMoreAction } from '../../app/(frontend)/actions'
import type { ListFilters, SortKey } from '../../lib/sorts'
import type { CardProduct } from '../../lib/types'
import { ProductCard } from '../product/ProductCard'

/** Grid with "Load more". Numbered page links stay underneath for Google and for people without JavaScript. */
export function ProductGrid({
  initial,
  total,
  page,
  totalPages,
  filters,
  sort,
  pageHref,
}: {
  initial: CardProduct[]
  total: number
  page: number
  totalPages: number
  filters: ListFilters
  sort: SortKey
  pageHref: Record<number, string>
}) {
  const [cards, setCards] = useState(initial)
  const [last, setLast] = useState(page)
  const [pending, start] = useTransition()

  // New page or filters from the server: start again from them.
  const [lastInitial, setLastInitial] = useState(initial)
  if (initial !== lastInitial) {
    setLastInitial(initial)
    setCards(initial)
    setLast(page)
  }

  const shownTo = Math.min(total, (page - 1) * 12 + cards.length)
  const more = () =>
    start(async () => {
      const res = await loadMoreAction(filters, sort, last + 1)
      setCards((c) => [...c, ...res.cards.filter((x) => !c.some((y) => y.id === x.id))])
      setLast(res.page)
    })

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <>
      <div className="ga">
        {cards.map((p, i) => (
          <ProductCard key={p.id} p={p} priority={i < 4} />
        ))}
      </div>
      {totalPages > 1 || total > cards.length ? (
        <div className="lm">
          <p className="lm-t">
            Showing {shownTo} of {total}
          </p>
          <div className="lm-bar">
            <span style={{ width: `${Math.round((shownTo / Math.max(1, total)) * 100)}%` }} />
          </div>
          {last < totalPages ? (
            <button className={`btn-o${pending ? ' is-loading' : ''}`} type="button" onClick={more} aria-busy={pending}>
              {pending ? 'Loading' : 'Load more'}
            </button>
          ) : null}
          {totalPages > 1 ? (
            <nav className="pg" aria-label="Pages">
              {pages.map((n) => (
                <Link key={n} href={pageHref[n]} className={n === page ? 'on' : ''} aria-current={n === page ? 'page' : undefined} scroll>
                  {n}
                </Link>
              ))}
              {page < totalPages ? (
                <Link href={pageHref[page + 1]} aria-label="Next page">
                  ›
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
