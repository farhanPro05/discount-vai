import type { Metadata } from 'next'
import Link from 'next/link'

import { ListingView } from '../../../../components/listing/ListingView'
import { ProductCard } from '../../../../components/product/ProductCard'
import { Icon } from '../../../../components/ui/Icon'
import { SHAPES, type ShapeKey } from '../../../../fields/shapes'
import { getNav, listProducts } from '../../../../lib/catalog'
import { parseListing } from '../../../../lib/listing'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = parseListing(await searchParams).q
  return { title: q ? `Search results for “${q}”` : 'Search', robots: { index: false, follow: true } }
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams
  const q = parseListing(sp).q
  const nav = await getNav()
  const popular = nav
    .filter((t) => !t.soon)
    .flatMap((t) => t.children.filter((c) => !c.soon))
    .slice(0, 6)

  const { total } = q ? await listProducts({ q }, 'best', 1, 1) : { total: 0 }

  if (!q || total === 0) {
    const picks = (await listProducts({}, 'best', 1, 4)).cards
    return (
      <div className="wrap pg-pad">
        <nav className="bc" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="cur" aria-current="page">
            Search
          </span>
        </nav>
        <div className="ct-l">
          <h1>{q ? `No results for “${q}”` : 'Search'}</h1>
          <span className="cnt2">{q ? '0 results' : ''}</span>
        </div>
        <div className="empty">
          <span className="empty-ic">
            <Icon name={q ? 'noResult' : 'search'} />
          </span>
          <h2>{q ? 'Nothing yet, vai' : 'What are you looking for?'}</h2>
          <p>
            {q
              ? 'Check the spelling, try a shorter word like "panjabi" or "shorts", or browse a category below.'
              : 'Search for Panjabi, shorts, jerseys, bags and more.'}
          </p>
          <form className="field-s big" action="/search" role="search">
            <Icon name="search" />
            <input type="search" name="q" defaultValue={q} aria-label="Search" placeholder="Search Panjabi, shorts, bags" />
          </form>
        </div>
        <div className="sh-d">
          <h2>Popular categories</h2>
        </div>
        <div className="pop-cats">
          {popular.map((c) => (
            <Link key={c.id} className="pc" href={c.href}>
              <svg className="cat-sil" viewBox="0 0 100 125" aria-hidden="true">
                <path d={SHAPES[(c.shape as ShapeKey) ?? 'tee']} fillRule="evenodd" />
              </svg>
              <span>{c.label.replace(/\s*\(.*\)/, '')}</span>
            </Link>
          ))}
        </div>
        {picks.length ? (
          <>
            <div className="sh-d mt">
              <h2>Vai&apos;s Picks</h2>
            </div>
            <div className="ga bs">
              {picks.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    )
  }

  return (
    <ListingView
      path={`/search?q=${encodeURIComponent(q)}`}
      title={`Results for “${q}”`}
      crumbs={[{ label: 'Home', href: '/' }]}
      here="Search"
      base={{ q }}
      searchParams={sp}
      defaultSort="best"
      sorts={['best', 'newest', 'price-asc', 'price-desc']}
      emptyName="products"
      fallback={{ label: 'Shop Men', href: '/men' }}
    />
  )
}
