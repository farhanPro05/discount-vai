'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { countAction } from '../../app/(frontend)/actions'
import type { Facets, ListFilters, SortKey } from '../../lib/sorts'
import { taka } from '../../lib/format'
import { listingHref, type ListingState } from '../../lib/listing'
import { Icon } from '../ui/Icon'
import { useEscape } from '../shop/ShopProvider'

type Draft = { sizes: string[]; colours: string[]; min?: number; max?: number; sale: boolean }

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  best: 'Best selling',
  discount: 'Biggest discount',
}

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

/** Slim filter bar (Option D): dropdowns on desktop/tablet, Filter and Sort bottom sheets on mobile. */
export function FilterBar({
  path,
  state,
  sorts,
  defaultSort,
  facets,
  base,
  total,
  showSaleToggle,
}: {
  path: string
  state: ListingState
  sorts: SortKey[]
  defaultSort: SortKey
  facets: Facets
  base: ListFilters
  total: number
  showSaleToggle: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState<'' | 'size' | 'colour' | 'price' | 'sort' | 'sheet' | 'sortsheet'>('')
  const [draft, setDraft] = useState<Draft>({ sizes: state.sizes, colours: state.colours, min: state.min, max: state.max, sale: state.sale })
  const [count, setCount] = useState<number | null>(total)
  const bar = useRef<HTMLDivElement>(null)
  useEscape(!!open, () => setOpen(''))

  // Reset the draft whenever the applied filters change.
  useEffect(() => {
    setDraft({ sizes: state.sizes, colours: state.colours, min: state.min, max: state.max, sale: state.sale })
    setCount(total)
  }, [state.sizes, state.colours, state.min, state.max, state.sale, total])

  // Live result count for the draft.
  useEffect(() => {
    if (!open || open === 'sort' || open === 'sortsheet') return
    let live = true
    const t = setTimeout(() => {
      countAction({ ...base, sizes: draft.sizes, colours: draft.colours, min: draft.min, max: draft.max, onSale: base.onSale || draft.sale || undefined })
        .then((n) => live && setCount(n))
        .catch(() => null)
    }, 200)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [draft, open, base])

  // Close dropdowns when clicking elsewhere.
  useEffect(() => {
    if (!open || open === 'sheet' || open === 'sortsheet') return
    const onDown = (e: MouseEvent) => {
      if (bar.current && !bar.current.contains(e.target as Node)) setOpen('')
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    document.body.classList.toggle('lock', open === 'sheet' || open === 'sortsheet')
    return () => document.body.classList.remove('lock')
  }, [open])

  const apply = (d: Draft = draft) => {
    setOpen('')
    router.push(listingHref(path, state, { sizes: d.sizes, colours: d.colours, min: d.min, max: d.max, sale: d.sale }, defaultSort), { scroll: false })
  }
  const setSort = (s: SortKey) => {
    setOpen('')
    router.push(listingHref(path, state, { sort: s }, defaultSort), { scroll: false })
  }
  const clearAll = () => setDraft({ sizes: [], colours: [], min: undefined, max: undefined, sale: false })
  const showN = count == null ? 'Show results' : count === 0 ? 'No matches' : `Show ${count} ${count === 1 ? 'result' : 'results'}`
  const n = (k: 'sizes' | 'colours') => (state[k].length ? ` (${state[k].length})` : '')
  const priceOn = state.min != null || state.max != null
  const activeCount = state.sizes.length + state.colours.length + (priceOn ? 1 : 0) + (state.sale && showSaleToggle ? 1 : 0)
  const hasSizes = facets.sizes.length > 0

  const sizeGrid = (
    <div className="sizes">
      {facets.sizes.map((s) => (
        <button
          key={s}
          type="button"
          className={draft.sizes.includes(s) ? 'sz on' : 'sz'}
          aria-pressed={draft.sizes.includes(s)}
          onClick={() => setDraft({ ...draft, sizes: toggle(draft.sizes, s) })}
        >
          {s}
        </button>
      ))}
    </div>
  )
  const colourGrid = (
    <div className="sw-grid">
      {facets.colours.map((c) => (
        <button
          key={c.name}
          type="button"
          className={draft.colours.includes(c.name) ? 'swc on' : 'swc'}
          aria-pressed={draft.colours.includes(c.name)}
          onClick={() => setDraft({ ...draft, colours: toggle(draft.colours, c.name) })}
        >
          <span className="sw" style={{ background: c.hex }} />
          {c.name}
        </button>
      ))}
    </div>
  )
  const priceFields = (
    <div className="prices2">
      <label className="fld">
        <span className="fl">Min (৳)</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={String(facets.min)}
          value={draft.min ?? ''}
          onChange={(e) => setDraft({ ...draft, min: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })}
        />
      </label>
      <label className="fld">
        <span className="fl">Max (৳)</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={String(facets.max)}
          value={draft.max ?? ''}
          onChange={(e) => setDraft({ ...draft, max: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })}
        />
      </label>
    </div>
  )
  const footer = (
    <div className="ddp-f">
      <button className="lnk" type="button" onClick={clearAll}>
        Clear
      </button>
      <button className="btn" type="button" onClick={() => apply()} disabled={count === 0}>
        {showN}
      </button>
    </div>
  )
  const sortList = (
    <div role="listbox" aria-label="Sort by">
      {sorts.map((s) => (
        <button key={s} type="button" role="option" aria-selected={state.sort === s} className={state.sort === s ? 'opt on' : 'opt'} onClick={() => setSort(s)}>
          <span className="radio" />
          {SORT_LABELS[s]}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <div className="fb-d" ref={bar}>
        {hasSizes ? (
          <span style={{ position: 'relative' }}>
            <button className={open === 'size' ? 'fx on' : 'fx'} type="button" aria-expanded={open === 'size'} onClick={() => setOpen(open === 'size' ? '' : 'size')}>
              Size{n('sizes')}
              <Icon name="chevDown" small />
            </button>
            {open === 'size' ? (
              <div className="ddp" role="dialog" aria-label="Filter by size">
                <p className="ddp-h">Size</p>
                {sizeGrid}
                {footer}
              </div>
            ) : null}
          </span>
        ) : null}
        {facets.colours.length ? (
          <span style={{ position: 'relative' }}>
            <button className={open === 'colour' ? 'fx on' : 'fx'} type="button" aria-expanded={open === 'colour'} onClick={() => setOpen(open === 'colour' ? '' : 'colour')}>
              Colour{n('colours')}
              <Icon name="chevDown" small />
            </button>
            {open === 'colour' ? (
              <div className="ddp" role="dialog" aria-label="Filter by colour">
                <p className="ddp-h">Colour</p>
                {colourGrid}
                {footer}
              </div>
            ) : null}
          </span>
        ) : null}
        <span style={{ position: 'relative' }}>
          <button className={open === 'price' ? 'fx on' : 'fx'} type="button" aria-expanded={open === 'price'} onClick={() => setOpen(open === 'price' ? '' : 'price')}>
            Price{priceOn ? ' (1)' : ''}
            <Icon name="chevDown" small />
          </button>
          {open === 'price' ? (
            <div className="ddp" role="dialog" aria-label="Filter by price">
              <p className="ddp-h">
                Price <span className="muted sm">({taka(facets.min)} to {taka(facets.max)})</span>
              </p>
              {priceFields}
              {footer}
            </div>
          ) : null}
        </span>
        {showSaleToggle ? (
          <button className={state.sale ? 'tog on' : 'tog'} type="button" aria-pressed={state.sale} onClick={() => apply({ ...draft, sale: !state.sale })}>
            On sale
          </button>
        ) : null}
        <span className="sp" />
        <span style={{ position: 'relative' }}>
          <button className={open === 'sort' ? 'fx on' : 'fx'} type="button" aria-expanded={open === 'sort'} onClick={() => setOpen(open === 'sort' ? '' : 'sort')}>
            Sort by: {SORT_LABELS[state.sort]}
            <Icon name="chevDown" small />
          </button>
          {open === 'sort' ? <div className="ddp right">{sortList}</div> : null}
        </span>

        <div className="fb-m">
          <button className="fx" type="button" onClick={() => setOpen('sheet')}>
            <Icon name="sliders" small />
            Filter{activeCount ? ` (${activeCount})` : ''}
          </button>
          <span className="vline" />
          <button className="fx" type="button" onClick={() => setOpen('sortsheet')}>
            <Icon name="sort" small />
            Sort
          </button>
        </div>
      </div>

      {open === 'sheet' ? (
        <>
          <button className="scrim" type="button" aria-label="Close filters" onClick={() => setOpen('')} />
          <div className="sheet tall" role="dialog" aria-modal="true" aria-label="Filter">
            <div className="sheet-h">
              <span className="grab" aria-hidden="true" />
              <h2>Filter</h2>
              <button className="ib" type="button" aria-label="Close" onClick={() => setOpen('')} autoFocus>
                <Icon name="x" />
              </button>
            </div>
            <div className="sheet-b">
              {hasSizes ? (
                <div className="acc">
                  <p className="acc-h">
                    Size<span className="muted">{draft.sizes.length ? draft.sizes.join(', ') : 'Any'}</span>
                  </p>
                  <div className="acc-b">{sizeGrid}</div>
                </div>
              ) : null}
              {facets.colours.length ? (
                <div className="acc">
                  <p className="acc-h">
                    Colour<span className="muted">{draft.colours.length ? draft.colours.join(', ') : 'Any'}</span>
                  </p>
                  <div className="acc-b">{colourGrid}</div>
                </div>
              ) : null}
              <div className="acc">
                <p className="acc-h">
                  Price
                  <span className="muted">
                    {taka(facets.min)} to {taka(facets.max)}
                  </span>
                </p>
                <div className="acc-b">{priceFields}</div>
              </div>
              {showSaleToggle ? (
                <div className="acc">
                  <label className="chk">
                    <input type="checkbox" checked={draft.sale} onChange={(e) => setDraft({ ...draft, sale: e.target.checked })} />
                    <span>On sale only</span>
                  </label>
                </div>
              ) : null}
            </div>
            <div className="sheet-f">
              <button className="btn-o" type="button" onClick={clearAll}>
                Clear all
              </button>
              <button className="btn" type="button" onClick={() => apply()} disabled={count === 0}>
                {showN}
              </button>
            </div>
          </div>
        </>
      ) : null}
      {open === 'sortsheet' ? (
        <>
          <button className="scrim" type="button" aria-label="Close sort" onClick={() => setOpen('')} />
          <div className="sheet short" role="dialog" aria-modal="true" aria-label="Sort by">
            <div className="sheet-h">
              <span className="grab" aria-hidden="true" />
              <h2>Sort by</h2>
              <button className="ib" type="button" aria-label="Close" onClick={() => setOpen('')} autoFocus>
                <Icon name="x" />
              </button>
            </div>
            <div className="sheet-b">{sortList}</div>
          </div>
        </>
      ) : null}
    </>
  )
}
