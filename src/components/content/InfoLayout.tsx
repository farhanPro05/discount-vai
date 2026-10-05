import Link from 'next/link'

import { getClient } from '../../lib/payload'
import { breadcrumbLd } from '../../lib/seo'
import { JsonLd } from '../ui/JsonLd'

type NavItem = { label: string; href: string; order: number }

/** Side menu of help and company pages (pages from the admin, plus FAQ and Size Guide). */
export async function getHelpNav(): Promise<NavItem[]> {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'pages',
    where: { showInHelpNav: { equals: true } },
    sort: 'navOrder',
    limit: 30,
    depth: 0,
    select: { title: true, navLabel: true, slug: true, navOrder: true },
  })
  const items: NavItem[] = res.docs.map((p) => ({ label: p.navLabel || p.title, href: `/${p.slug}`, order: p.navOrder ?? 10 }))
  items.push({ label: 'FAQ', href: '/faq', order: 2 }, { label: 'Size Guide', href: '/size-guide', order: 5 })
  return items.sort((a, b) => a.order - b.order)
}

/** Template for About, FAQ, policies and the size guide: side menu on desktop, chips on mobile. */
export async function InfoLayout({ current, crumb, children }: { current: string; crumb: string; children: React.ReactNode }) {
  const nav = await getHelpNav()
  return (
    <div className="wrap pg-pad">
      <JsonLd data={breadcrumbLd([{ name: 'Home', path: '/' }, { name: crumb, path: current }])} />
      <nav className="bc" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="cur" aria-current="page">
          {crumb}
        </span>
      </nav>
      <div className="info-l">
        <nav className="side-nav show-d" aria-label="Help and company">
          {nav.map((n) => (
            <Link key={n.href} className={n.href === current ? 'on' : ''} href={n.href} aria-current={n.href === current ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <article className="prose">
          <div className="chips hide-d">
            {nav.map((n) => (
              <Link key={n.href} className={n.href === current ? 'chip on' : 'chip'} href={n.href}>
                {n.label}
              </Link>
            ))}
          </div>
          {children}
        </article>
      </div>
    </div>
  )
}
