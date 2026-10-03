'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { FeatureTile, Img, NavCategory } from '../../lib/types'
import { useEscape, useShop } from '../shop/ShopProvider'
import { Lifestyle, Wordmark } from '../ui/Art'
import { Icon } from '../ui/Icon'

export type Socials = { facebook: string | null; instagram: string | null; tiktok: string | null; whatsapp: string | null }

const GROUPS = [
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'tops', label: 'Tops & Outerwear' },
  { key: 'traditional', label: 'Traditional' },
]

function FeatureCard({ tile, fallbackHref, shapes }: { tile: FeatureTile | null; fallbackHref: string; shapes: Parameters<typeof Lifestyle>[0]['shapes'] }) {
  if (!tile) return null
  return (
    <Lifestyle as="a" href={tile.link || fallbackHref} className="mfeat" img={tile.image} shapes={shapes} sizes="480px">
      <span className="mfeat-t">
        {tile.eyebrow ? <span className="eb">{tile.eyebrow}</span> : null}
        {tile.title ? <b>{tile.title}</b> : null}
        <span className="lnk">{tile.linkLabel || 'Shop now'}</span>
      </span>
    </Lifestyle>
  )
}

function Mega({ top, feature }: { top: NavCategory; feature: FeatureTile | null }) {
  const grouped = top.children.some((c) => c.group)
  if (!grouped) {
    return (
      <div className="mega" role="region" aria-label={`${top.label} menu`}>
        <div className="wrap mega-in acc2">
          <div className="mcol">
            <p className="mh">{top.label}</p>
            {top.children.map((c) => (
              <Link key={c.id} href={c.href}>
                {c.label}
                {c.soon ? <span className="soon" style={{ marginLeft: 8 }}>Soon</span> : null}
              </Link>
            ))}
            <Link href={top.href}>Shop All {top.label}</Link>
          </div>
          <FeatureCard tile={feature} fallbackHref={top.href} shapes={['backpack', 'tote']} />
        </div>
      </div>
    )
  }
  const cols = GROUPS.map((g) => ({ ...g, items: top.children.filter((c) => c.group === g.key) })).filter((g) => g.items.length)
  const loose = top.children.filter((c) => !c.group)
  return (
    <div className="mega" role="region" aria-label={`${top.label} menu`}>
      <div className="wrap mega-in">
        {cols.map((g, i) => (
          <div className="mcol" key={g.key}>
            <p className="mh">{g.label}</p>
            {g.items.map((c) => (
              <Link key={c.id} href={c.href}>
                {c.label}
              </Link>
            ))}
            {i === cols.length - 1 ? (
              <>
                {loose.map((c) => (
                  <Link key={c.id} href={c.href}>
                    {c.label}
                  </Link>
                ))}
                <p className="mh mt">Quick links</p>
                <Link href={top.href}>Shop All {top.label}</Link>
                <Link href="/new-arrivals">New In</Link>
                <Link className="sale" href="/sale">
                  Sale
                </Link>
              </>
            ) : null}
          </div>
        ))}
        {cols.length < 3 ? Array.from({ length: 3 - cols.length }, (_, i) => <span key={i} />) : null}
        <FeatureCard tile={feature} fallbackHref={top.href} shapes={['panjabi', 'panjabi']} />
      </div>
    </div>
  )
}

export function HeaderClient({
  nav,
  logo,
  features,
  socials,
}: {
  nav: NavCategory[]
  logo: Img | null
  features: Record<string, FeatureTile | null>
  socials: Socials
}) {
  const { count, ready, openDrawer, openSearch, menuOpen, openMenu, closeMenu } = useShop()
  const [open, setOpen] = useState<string | null>(null)
  const [sticky, setSticky] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close the mega menu when the page changes.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(null)
  }
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEscape(!!open, () => setOpen(null))
  useEscape(menuOpen, closeMenu)

  const enter = (slug: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(slug)
  }
  const leave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(null), 120)
  }
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const cartLabel = `Cart, ${ready ? count : 0} ${count === 1 ? 'item' : 'items'}`

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim()
    closeMenu()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <div className={`hwrap${menuOpen ? ' open' : ''}`} onMouseLeave={leave}>
      <header className={`hdr${sticky ? ' is-sticky' : ''}`}>
        <div className="wrap">
          <div className="hdr-d">
            <Wordmark logo={logo} />
            <nav className="nav" aria-label="Main">
              {nav.map((top) => {
                const hasMenu = top.children.length > 0 && !top.soon
                return (
                  <Link
                    key={top.id}
                    href={top.href}
                    className={isActive(top.href) ? 'on' : ''}
                    aria-expanded={hasMenu ? open === top.slug : undefined}
                    aria-haspopup={hasMenu ? 'true' : undefined}
                    onMouseEnter={() => enter(hasMenu ? top.slug : null)}
                    onFocus={() => hasMenu && enter(top.slug)}
                    onClick={(e) => {
                      // On touch screens the first tap opens the menu, the second follows the link.
                      if (hasMenu && open !== top.slug && window.matchMedia('(hover: none)').matches) {
                        e.preventDefault()
                        enter(top.slug)
                      }
                    }}
                  >
                    {top.label}
                    {top.soon ? <span className="soon">Soon</span> : null}
                    {hasMenu ? <Icon name="chevDown" /> : null}
                  </Link>
                )
              })}
              <Link href="/new-arrivals" className={isActive('/new-arrivals') ? 'on' : ''} onMouseEnter={() => enter(null)}>
                New Arrivals
              </Link>
              <Link href="/sale" className={`sale${isActive('/sale') ? ' on' : ''}`} onMouseEnter={() => enter(null)}>
                Sale
              </Link>
            </nav>
            <div className="hicons">
              <button className="ib" type="button" aria-label="Search" onClick={openSearch}>
                <Icon name="search" />
              </button>
              <Link className="ib" href="/account" aria-label="Account">
                <Icon name="user" />
              </Link>
              <button className="ib" type="button" aria-label={cartLabel} onClick={openDrawer}>
                <Icon name="bag" />
                {ready && count > 0 ? <span className="cnt">{count}</span> : null}
              </button>
            </div>
          </div>

          <div className="hdr-s">
            <div className="hl">
              <button className="ib" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={openMenu}>
                <Icon name="menu" />
              </button>
            </div>
            <Wordmark logo={logo} />
            <div className="hicons">
              <button className="ib" type="button" aria-label="Search" onClick={openSearch}>
                <Icon name="search" />
              </button>
              <button className="ib" type="button" aria-label={cartLabel} onClick={openDrawer}>
                <Icon name="bag" />
                {ready && count > 0 ? <span className="cnt">{count}</span> : null}
              </button>
            </div>
          </div>
        </div>
      </header>

      {nav.map((top) =>
        open === top.slug && top.children.length ? (
          <div key={top.id} className="show-d" onMouseEnter={() => enter(top.slug)}>
            <Mega top={top} feature={features[top.slug] ?? null} />
          </div>
        ) : null,
      )}

      {menuOpen ? (
        <>
          <button className="scrim" type="button" aria-label="Close menu" onClick={closeMenu} />
          <aside className="drawer" aria-label="Menu" role="dialog" aria-modal="true">
            <div className="dr-top">
              <Wordmark logo={logo} />
              <button className="ib" type="button" aria-label="Close menu" onClick={closeMenu} autoFocus>
                <Icon name="x" />
              </button>
            </div>
            <form className="field-s" role="search" onSubmit={onSearch}>
              <Icon name="search" />
              <input type="search" name="q" placeholder="Search Panjabi, shorts, bags" aria-label="Search" />
            </form>
            <nav className="dr-nav" aria-label="Shop">
              {nav.map((top) =>
                top.children.length && !top.soon ? (
                  <div key={top.id}>
                    <button
                      className="dr-i"
                      type="button"
                      aria-expanded={expanded === top.slug}
                      onClick={() => setExpanded(expanded === top.slug ? null : top.slug)}
                    >
                      {top.label}
                      <Icon name="chevRight" small className={expanded === top.slug ? 'rot' : ''} />
                    </button>
                    {expanded === top.slug ? (
                      <div className="dr-sub">
                        {top.children.map((c) => (
                          <Link key={c.id} href={c.href}>
                            {c.label}
                            {c.soon ? <span className="soon">Soon</span> : null}
                          </Link>
                        ))}
                        <Link className="all" href={top.href}>
                          Shop All {top.label}
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link key={top.id} className="dr-i" href={top.href}>
                    {top.label}
                    {top.soon ? <span className="soon">Soon</span> : null}
                  </Link>
                ),
              )}
              <Link className="dr-i" href="/new-arrivals">
                New Arrivals
              </Link>
              <Link className="dr-i sale" href="/sale">
                Sale
              </Link>
            </nav>
            <hr className="dr-hr" />
            <nav className="dr-nav sm" aria-label="Help">
              <Link className="dr-i" href="/account">
                <Icon name="user" />
                Account
              </Link>
              <Link className="dr-i" href="/track-order">
                <Icon name="truck" />
                Track Order
              </Link>
              <Link className="dr-i" href="/contact">
                <Icon name="help" />
                Help &amp; Contact
              </Link>
            </nav>
            <SocialIcons socials={socials} className="socials" />
          </aside>
        </>
      ) : null}
    </div>
  )
}

export function SocialIcons({ socials, className }: { socials: Socials; className: string }) {
  const items = [
    { key: 'facebook', label: 'Facebook', href: socials.facebook },
    { key: 'instagram', label: 'Instagram', href: socials.instagram },
    { key: 'tiktok', label: 'TikTok', href: socials.tiktok },
    { key: 'whatsapp', label: 'WhatsApp', href: socials.whatsapp },
  ] as const
  const shown = items.filter((i) => i.href)
  if (!shown.length) return null
  return (
    <div className={className}>
      {shown.map((i) => (
        <a key={i.key} className="ib" href={i.href as string} aria-label={i.label} target="_blank" rel="noopener noreferrer">
          <Icon name={i.key} />
        </a>
      ))}
    </div>
  )
}
