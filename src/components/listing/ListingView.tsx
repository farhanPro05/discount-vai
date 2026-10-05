import Link from 'next/link'

import { getFacets, listProducts, type ListFilters, type SortKey } from '../../lib/catalog'
import { taka } from '../../lib/format'
import { hasFilters, listingHref, parseListing, toFilters, type SearchParams } from '../../lib/listing'
import { breadcrumbLd, faqLd, itemListLd } from '../../lib/seo'
import { Lifestyle } from '../ui/Art'
import { Accordion } from '../ui/Accordion'
import { Icon } from '../ui/Icon'
import { JsonLd } from '../ui/JsonLd'
import { ReadMore } from '../ui/ReadMore'
import { FilterBar } from './FilterBar'
import { ProductGrid } from './ProductGrid'

export type Crumb = { label: string; href: string }
export type Chip = { label: string; href: string; on?: boolean }

/** Category / sale / new arrivals listing (Option D: classic 4 / 3 / 2 grid with a slim filter bar). */
export async function ListingView({
  path,
  title,
  crumbs,
  here,
  intro,
  introMore,
  chips,
  base,
  searchParams,
  defaultSort = 'newest',
  sorts = ['newest', 'price-asc', 'price-desc', 'best'],
  showSaleToggle = true,
  faqTitle,
  faqs,
  saleBanner,
  emptyName,
  fallback,
  children,
}: {
  path: string
  title: string
  crumbs: Crumb[]
  here: string
  intro?: string | null
  introMore?: string | null
  chips?: Chip[]
  base: ListFilters
  searchParams: SearchParams
  defaultSort?: SortKey
  sorts?: SortKey[]
  showSaleToggle?: boolean
  faqTitle?: string | null
  faqs?: { question: string; answer: string }[] | null
  saleBanner?: { eyebrow: string; heading: string; text: string } | null
  emptyName: string
  fallback: Crumb
  children?: React.ReactNode
}) {
  const state = parseListing(searchParams, defaultSort)
  const filters = toFilters(state, base)
  const [list, facets] = await Promise.all([listProducts(filters, state.sort, state.page), getFacets(base)])
  const filtered = hasFilters(state)
  const pageHref: Record<number, string> = {}
  for (let n = 1; n <= Math.max(1, list.totalPages); n++) pageHref[n] = listingHref(path, state, { page: n }, defaultSort)

  const active = [
    ...state.sizes.map((s) => ({ label: `Size: ${s}`, href: listingHref(path, state, { sizes: state.sizes.filter((x) => x !== s) }, defaultSort) })),
    ...state.colours.map((c) => ({ label: `Colour: ${c}`, href: listingHref(path, state, { colours: state.colours.filter((x) => x !== c) }, defaultSort) })),
    ...(state.min != null || state.max != null
      ? [
          {
            label: state.min != null && state.max != null ? `${taka(state.min)} to ${taka(state.max)}` : state.min != null ? `From ${taka(state.min)}` : `Under ${taka(state.max)}`,
            href: listingHref(path, state, { min: undefined, max: undefined }, defaultSort),
          },
        ]
      : []),
    ...(state.sale && showSaleToggle ? [{ label: 'On sale', href: listingHref(path, state, { sale: false }, defaultSort) }] : []),
  ]
  const clearHref = listingHref(path, state, { sizes: [], colours: [], min: undefined, max: undefined, sale: false }, defaultSort)
  const crumbTrail = [...crumbs, { label: here, href: path }]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd(crumbTrail.map((c) => ({ name: c.label, path: c.href }))),
          itemListLd(list.cards, title),
          ...(faqs?.length ? [faqLd(faqs)] : []),
        ]}
      />
      {saleBanner ? (
        <Lifestyle as="section" className="sale-bn" shapes={['jacket', 'panjabi']} aria-label={saleBanner.heading}>
          <div className="wrap sale-bn-in">
            <span className="eb">{saleBanner.eyebrow}</span>
            <p className="sale-h">{saleBanner.heading}</p>
            <p>{saleBanner.text}</p>
          </div>
        </Lifestyle>
      ) : null}
      <div className="cat-pg">
        <div className="wrap">
          <nav className="bc" aria-label="Breadcrumb">
            {crumbs.map((c) => (
              <span key={c.href} style={{ display: 'contents' }}>
                <Link href={c.href}>{c.label}</Link>
                <span aria-hidden="true">/</span>
              </span>
            ))}
            <span className="cur" aria-current="page">
              {here}
            </span>
          </nav>
          <div className="ct-l">
            <div>
              <h1>{title}</h1>
              {intro ? (
                <p className="intro">
                  {intro}
                  {introMore ? <ReadMore more={introMore} inline /> : null}
                </p>
              ) : null}
            </div>
            <span className="cnt2">
              {list.total.toLocaleString('en-US')} {list.total === 1 ? 'product' : 'products'}
            </span>
          </div>

          {chips?.length ? (
            <div className="chips">
              {chips.map((c) => (
                <Link key={c.href + c.label} className={c.on ? 'chip on' : 'chip'} href={c.href} aria-current={c.on ? 'page' : undefined}>
                  {c.label}
                </Link>
              ))}
            </div>
          ) : null}

          {list.total > 0 || filtered ? (
            <FilterBar
              path={path}
              state={state}
              sorts={sorts}
              defaultSort={defaultSort}
              facets={facets}
              base={base}
              total={list.total}
              showSaleToggle={showSaleToggle}
            />
          ) : null}

          {active.length ? (
            <div className="act">
              {active.map((a) => (
                <Link key={a.label} className="chip act-c" href={a.href} scroll={false} aria-label={`Remove filter ${a.label}`}>
                  {a.label}
                  <Icon name="x" small />
                </Link>
              ))}
              <Link className="lnk" href={clearHref} scroll={false}>
                Clear all
              </Link>
            </div>
          ) : null}

          {list.total > 0 ? (
            <ProductGrid
              initial={list.cards}
              total={list.total}
              page={list.page}
              totalPages={list.totalPages}
              filters={filters}
              sort={state.sort}
              pageHref={pageHref}
            />
          ) : (
            <div className="empty">
              <span className="empty-ic">
                <Icon name="noResult" />
              </span>
              <h2>{filtered ? `No ${emptyName} match these filters` : `No ${emptyName} here yet`}</h2>
              <p>
                {filtered
                  ? 'Try removing a filter or two. Most sizes and colours restock every week.'
                  : 'New styles land every week. Check back soon, or browse the rest of the shop.'}
              </p>
              <div className="empty-a">
                {filtered ? (
                  <Link className="btn lg" href={clearHref}>
                    Clear all filters
                  </Link>
                ) : null}
                <Link className="btn-o" href={fallback.href}>
                  {fallback.label}
                </Link>
              </div>
            </div>
          )}

          {children}

          {faqs?.length && list.total > 0 ? (
            <section className="faqb" aria-labelledby="faq-h">
              <h2 id="faq-h">{faqTitle || 'FAQ'}</h2>
              <Accordion items={faqs.map((f) => ({ title: f.question, body: <p>{f.answer}</p> }))} />
            </section>
          ) : null}
        </div>
      </div>
    </>
  )
}

