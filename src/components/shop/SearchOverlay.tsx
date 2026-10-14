'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { searchDefaultsAction, suggestAction } from '../../app/(frontend)/actions'
import { taka } from '../../lib/format'
import type { CardProduct } from '../../lib/types'
import { Sil } from '../ui/Art'
import { Icon } from '../ui/Icon'
import { useEscape, useShop } from './ShopProvider'

type Results = { products: CardProduct[]; categories: { label: string; href: string; count: string }[]; total: number; terms: string[] }

function Row({ p }: { p: CardProduct }) {
  const c = p.colours[0]
  const img = c?.images[0]
  return (
    <Link className="sp-row" href={p.href}>
      <span className="sp-th">{img ? <Image src={img.url} alt="" fill sizes="52px" /> : <Sil shape={p.shape} fill={c?.hex} className="" />}</span>
      <span className="sp-t">
        <b>{p.name}</b>
        <small>
          {c?.name}
          {p.out ? ' · Sold out' : ''}
        </small>
      </span>
      <span className="pr">
        <span className={p.onSale ? 'now sale' : 'now'}>{taka(p.price)}</span>
        {p.onSale ? <s className="was">{taka(p.was)}</s> : null}
      </span>
    </Link>
  )
}

/** Search with live suggestions: a panel on desktop/tablet, full screen on mobile. */
export function SearchOverlay() {
  const { searchOpen, closeSearch } = useShop()
  const [q, setQ] = useState('')
  const [found, setFound] = useState<Results | null>(null)
  const [defaults, setDefaults] = useState<{ picks: CardProduct[]; popular: string[] } | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()
  useEscape(searchOpen, closeSearch)

  useEffect(() => {
    if (!searchOpen) return
    input.current?.focus()
    if (!defaults) searchDefaultsAction().then(setDefaults).catch(() => null)
  }, [searchOpen, defaults])

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) return
    let live = true
    const t = setTimeout(() => {
      suggestAction(term)
        .then((r) => live && setFound(r))
        .catch(() => null)
    }, 180)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [q])

  if (!searchOpen) return null
  const term = q.trim()
  const res = term.length >= 2 ? found : null
  const go = (value: string) => {
    closeSearch()
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }
  const terms = term.length >= 2 ? (res?.terms.length ? res.terms : [term]) : (defaults?.popular ?? [])
  const products = res ? res.products : (defaults?.picks ?? [])

  return (
    <>
      <button className="scrim hide-m" type="button" aria-label="Close search" onClick={closeSearch} />
      <div className="srch-ov" role="dialog" aria-modal="true" aria-label="Search">
        <div className="wrap">
          <form
            className="srch-bar"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              if (term) go(term)
            }}
          >
            <button className="ib show-m" type="button" aria-label="Back" onClick={closeSearch}>
              <Icon name="arrowLeft" />
            </button>
            <label className="field-s big">
              <Icon name="search" />
              <input
                ref={input}
                type="search"
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Panjabi, shorts, bags"
                aria-label="Search"
                autoComplete="off"
                enterKeyHint="search"
              />
              {q ? (
                <button className="lnk" type="button" onClick={() => setQ('')}>
                  Clear
                </button>
              ) : null}
            </label>
            <button className="ib hide-m" type="button" aria-label="Close search" onClick={closeSearch}>
              <Icon name="x" />
            </button>
          </form>
          <div className="srch-cols">
            <div className="srch-c">
              <p className="ft-h2">{term.length >= 2 ? 'Suggestions' : 'Popular searches'}</p>
              {terms.map((t) => (
                <button key={t} type="button" className="term" onClick={() => go(t)}>
                  <Icon name="search" small />
                  {t}
                </button>
              ))}
              {res?.categories.length ? (
                <>
                  <p className="ft-h2 mt">Categories</p>
                  {res.categories.map((c) => (
                    <Link key={c.href} className="term" href={c.href}>
                      {c.label}
                      <span className="muted">{c.count}</span>
                    </Link>
                  ))}
                </>
              ) : null}
            </div>
            <div className="srch-c wide">
              <p className="ft-h2">{res ? 'Products' : "Vai's Picks"}</p>
              {products.map((p) => (
                <Row key={p.id} p={p} />
              ))}
              {res && !res.products.length ? <p className="muted pad">No products match “{term}” yet. Press enter to search everything.</p> : null}
              {term.length >= 2 ? (
                <button className="btn-o full" type="button" onClick={() => go(term)}>
                  See all results for “{term}”{res?.total ? ` (${res.total})` : ''}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
