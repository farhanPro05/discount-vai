import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { DealBanner } from '../../../components/home/DealBanner'
import { HeroSlider, type Slide } from '../../../components/home/HeroSlider'
import { Carousel } from '../../../components/product/Carousel'
import { ProductCard } from '../../../components/product/ProductCard'
import { NewsletterForm } from '../../../components/shop/NewsletterForm'
import { Lifestyle } from '../../../components/ui/Art'
import { Icon, Stars, type IconName } from '../../../components/ui/Icon'
import { JsonLd } from '../../../components/ui/JsonLd'
import { ReadMore } from '../../../components/ui/ReadMore'
import { HOME_SECTIONS, type HomeSectionKey } from '../../../globals/homeSections'
import { SHAPES, type ShapeKey } from '../../../fields/shapes'
import { getCards, getNav, listProducts } from '../../../lib/catalog'
import { toImg } from '../../../lib/media'
import { getClient } from '../../../lib/payload'
import { organizationLd, websiteLd } from '../../../lib/seo'
import { getCommerceInfo, getHome, getSite } from '../../../lib/settings'

export const metadata: Metadata = {
  title: { absolute: 'Discount Vai | Men’s Clothing & Panjabi Online in Bangladesh' },
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [home, nav, site, commerce] = await Promise.all([getHome(), getNav(), getSite(), getCommerceInfo()])
  const order: HomeSectionKey[] = home.sections?.length ? home.sections.map((s) => s.section) : HOME_SECTIONS.map((s) => s.value)

  const render: Record<HomeSectionKey, () => Promise<React.ReactNode> | React.ReactNode> = {
    hero: () => {
      const slides: Slide[] = (home.slides ?? []).map((s) => ({
        eyebrow: s.eyebrow,
        heading: s.heading,
        text: s.text,
        ctaLabel: s.ctaLabel,
        ctaLink: s.ctaLink,
        desktop: toImg(s.imageDesktop, s.heading),
        mobile: toImg(s.imageMobile, s.heading),
      }))
      return slides.length ? <HeroSlider slides={slides} /> : <h1 className="sr">Discount Vai: men&apos;s clothing online in Bangladesh</h1>
    },

    categories: () => {
      const tiles = nav.filter((t) => !t.soon).flatMap((t) => t.children.filter((c) => !c.soon))
      if (!tiles.length) return null
      const firstTop = nav.find((t) => !t.soon && t.children.length)
      return (
        <section className="sec sec-t" aria-labelledby="h-cats">
          <div className="wrap">
            <div className="sh-d">
              <h2 id="h-cats">{home.categoriesHeading || 'Shop by Category'}</h2>
              {firstTop ? (
                <div className="r">
                  <Link className="lnk" href={firstTop.href}>
                    Shop all {firstTop.label}
                  </Link>
                </div>
              ) : null}
            </div>
            <div className="cats">
              {tiles.map((c, i) => (
                <Link key={c.id} className={`cat${i === tiles.length - 1 && tiles.length % 4 === 1 ? ' wide' : ''}`} href={c.href}>
                  <span className="cat-img">
                    {c.image ? (
                      <Image src={c.image.url} alt="" fill sizes="(min-width: 1024px) 320px, 45vw" />
                    ) : (
                      <svg className="cat-sil" viewBox="0 0 100 125" aria-hidden="true">
                        <path d={SHAPES[c.shape ?? 'tee']} fillRule="evenodd" />
                      </svg>
                    )}
                  </span>
                  <span className="cat-l">
                    <span>
                      <b>{c.label}</b>
                      {c.tileText ? <small>{c.tileText}</small> : null}
                    </span>
                    <Icon name="arrowRight" small />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )
    },

    newArrivals: async () => {
      const { cards } = await listProducts({}, 'newest', 1, home.newArrivals?.count ?? 8)
      if (!cards.length) return null
      return (
        <section className="sec sec-t" aria-label={home.newArrivals?.heading || 'New Arrivals'}>
          <div className="wrap">
            <Carousel title={home.newArrivals?.heading || 'New Arrivals'} items={cards} link="/new-arrivals" />
          </div>
        </section>
      )
    },

    deal: () =>
      home.deal?.heading ? (
        <DealBanner
          eyebrow={home.deal.eyebrow}
          heading={home.deal.heading}
          text={home.deal.text}
          endsAt={home.deal.endsAt}
          ctaLabel={home.deal.ctaLabel}
          ctaLink={home.deal.ctaLink}
        />
      ) : null,

    featured: async () => {
      const f = home.featured
      if (!f?.heading) return null
      // The layout pairs the photo with product cards, so it waits until the collection has products.
      const cards = await getCards(f.products)
      if (!cards.length) return null
      return (
        <section className="sec sec-t" aria-labelledby="h-feat">
          <div className="wrap">
            <div className="sh-d">
              <h2 id="h-feat">{f.heading}</h2>
              {f.link ? (
                <div className="r">
                  <Link className="lnk" href={f.link}>
                    {f.linkLabel || 'Shop the collection'}
                  </Link>
                </div>
              ) : null}
            </div>
            <div className="fe-d">
              <Lifestyle className="figs-r" img={toImg(f.image, f.title ?? f.heading)} sizes="(min-width: 768px) 50vw, 100vw">
                <div className="ov">
                  {f.eyebrow ? <span className="eb">{f.eyebrow}</span> : null}
                  {f.title ? <h3>{f.title}</h3> : null}
                  {f.text ? <p>{f.text}</p> : null}
                  {f.link ? (
                    <Link className="btn" href={f.link}>
                      {f.linkLabel || 'Shop the collection'}
                    </Link>
                  ) : null}
                </div>
              </Lifestyle>
              <div className="g2">
                {cards.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} p={p} sizes="(min-width: 1024px) 320px, (min-width: 768px) 25vw, 46vw" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )
    },

    bestSellers: async () => {
      let cards = await getCards(home.bestSellers?.products)
      if (!cards.length) cards = (await listProducts({}, 'best', 1, 4)).cards
      if (!cards.length) return null
      return (
        <section className="sec sec-t" aria-labelledby="h-best">
          <div className="wrap">
            <div className="sh-d">
              <h2 id="h-best">{home.bestSellers?.heading || "Vai's Best Sellers"}</h2>
              <div className="r">
                <Link className="lnk" href="/men?sort=best">
                  View all
                </Link>
              </div>
            </div>
            <div className="ga bs">
              {cards.slice(0, 4).map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )
    },

    bags: () => {
      const b = home.bags
      if (!b?.heading) return null
      return (
        <section className="sec sec-t" aria-labelledby="h-bags">
          <div className="wrap">
            <div className="split">
              <Lifestyle className="split-img" img={toImg(b.image, b.heading)} shapes={['backpack', 'tote']} sizes="(min-width: 768px) 50vw, 100vw" />
              <div className="split-t">
                {b.eyebrow ? <span className="eb">{b.eyebrow}</span> : null}
                <h2 id="h-bags">{b.heading}</h2>
                {b.text ? <p>{b.text}</p> : null}
                {b.chips?.length ? (
                  <div className="chip-row">
                    {b.chips.map((c) => (
                      <Link key={c.label} className="chip" href={c.link}>
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
                {b.ctaLink ? (
                  <Link className="btn lg" href={b.ctaLink}>
                    {b.ctaLabel || 'Shop bags'}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      )
    },

    womenTeaser: () => {
      const w = home.womenTeaser
      if (!w?.heading) return null
      return (
        <section className="sec sec-t" aria-labelledby="h-women">
          <div className="wrap">
            <div className="teaser">
              {w.pill ? <span className="soon lg">{w.pill}</span> : null}
              <h2 id="h-women">{w.heading}</h2>
              {w.text ? <p>{w.text}</p> : null}
              <NewsletterForm source="home-teaser" interest="women" button="Get notified" label="Email address for the women's launch" done="You're on the list. We'll email you on launch day." />
              {w.link ? (
                <Link className="lnk" href={w.link}>
                  {w.linkLabel || 'Take a sneak peek'}
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      )
    },

    trust: () =>
      home.trust?.length ? (
        <section className="trust" aria-label="Why shop with us">
          <div className="wrap trust-in">
            {home.trust.map((t) => (
              <div className="tr-i" key={t.title}>
                <Icon name={(t.icon ?? 'exchange') as IconName} />
                <span>
                  <b>{t.title}</b>
                  {t.subtitle ? <small>{t.subtitle}</small> : null}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    reviews: async () => {
      const payload = await getClient()
      const res = await payload.find({ collection: 'reviews', where: { featured: { equals: true } }, sort: 'order', limit: 6, depth: 1 })
      if (!res.docs.length) return null
      return (
        <section className="sec" aria-labelledby="h-rev">
          <div className="wrap">
            <div className="sh-d">
              <h2 id="h-rev">{home.reviews?.heading || 'What our customers say'}</h2>
              {home.reviews?.ratingText ? (
                <div className="r">
                  <span className="rating">{home.reviews.ratingText}</span>
                </div>
              ) : null}
            </div>
            <div className="rv-row">
              {res.docs.map((r) => (
                <figure className="rv" key={r.id}>
                  <Lifestyle className="rv-img" img={toImg(r.photo, `${r.name}, Discount Vai customer`)} shapes={[(r.shape as ShapeKey) ?? 'panjabi']} sizes="420px" />
                  <div className="rv-b">
                    <Stars rating={r.rating} />
                    <blockquote>{r.quote}</blockquote>
                    <figcaption>
                      <span>
                        <b>{r.name}</b> · {r.city}
                      </span>
                      {r.productName ? <small>Bought: {r.productName}</small> : null}
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )
    },

    seo: () => {
      const s = home.seo
      if (!s?.text) return null
      return (
        <section className="sec sec-t" aria-labelledby="h-about">
          <div className="wrap">
            <div className="seo">
              <h2 id="h-about">{s.heading || 'About Discount Vai'}</h2>
              <p>{s.text}</p>
              {s.more ? <ReadMore more={s.more} /> : null}
            </div>
          </div>
        </section>
      )
    },
  }

  const sections = await Promise.all(order.map((key) => render[key]?.()))

  return (
    <>
      <JsonLd data={[organizationLd(site, commerce.payments), websiteLd()]} />
      {sections.map((node, i) => (
        <div key={`${order[i]}-${i}`} style={{ display: 'contents' }}>
          {node}
        </div>
      ))}
    </>
  )
}
