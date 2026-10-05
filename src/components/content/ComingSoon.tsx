import Link from 'next/link'

import type { ShapeKey } from '../../fields/shapes'
import { getNav } from '../../lib/catalog'
import type { Img } from '../../lib/types'
import { NewsletterForm } from '../shop/NewsletterForm'
import { Lifestyle } from '../ui/Art'

/** Branded Coming Soon page for a category (e.g. Women) with a "Notify me" sign-up. */
export async function CategoryComingSoon({
  name,
  slug,
  heading,
  text,
  image,
  shape,
}: {
  name: string
  slug: string
  heading?: string | null
  text?: string | null
  image?: Img | null
  shape?: ShapeKey | null
}) {
  const nav = await getNav()
  const meantime = nav
    .filter((t) => !t.soon && t.slug !== slug)
    .slice(0, 2)
    .map((t) => {
      const firstLive = t.children.filter((c) => !c.soon)
      const target = t.children.length === 1 ? firstLive[0] : null
      return {
        label: `Shop ${target ? target.label.replace(/\s*\(.*\)/, '') : t.label}`,
        href: target ? target.href : t.href,
        sub: firstLive
          .slice(0, 3)
          .map((c) => c.label)
          .join(', '),
        shape: (firstLive[0]?.shape ?? 'tee') as ShapeKey,
      }
    })
  return (
    <>
      <Lifestyle as="section" className="soon-hero" img={image} shapes={[shape ?? 'panjabi', 'tote']} priority>
        <div className="wrap soon-in">
          <div className="soon-card">
            <span className="soon lg">Coming soon</span>
            <h1>{heading || `${name} is coming soon`}</h1>
            {text ? <p>{text}</p> : null}
            <NewsletterForm source="coming-soon" interest={slug} button="Notify me" label={`Email for the ${name} launch`} done="You're on the list. We'll email you on launch day." />
          </div>
        </div>
      </Lifestyle>
      {meantime.length ? (
        <div className="wrap pg-pad">
          <div className="sh-d">
            <h2>Shop in the meantime</h2>
          </div>
          <div className="meantime">
            {meantime.map((m) => (
              <Lifestyle key={m.href} as="a" href={m.href} className="mt-tile" shapes={[m.shape]}>
                <span className="mt-t">
                  <b>{m.label}</b>
                  {m.sub ? <span className="lnk">{m.sub} and more</span> : null}
                </span>
              </Lifestyle>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}

/** Simple Coming Soon page for something that isn't built yet (e.g. the Style Guide blog). */
export function SimpleComingSoon({ title, text, interest }: { title: string; text: string; interest: string }) {
  return (
    <div className="wrap narrow res">
      <span className="soon lg">Soon</span>
      <h1>{title}</h1>
      <p className="res-sub">{text}</p>
      <NewsletterForm source="coming-soon" interest={interest} button="Notify me" done="You're on the list. We'll let you know when it's live." />
      <div className="empty-a">
        <Link className="btn-o" href="/men">
          Shop Men
        </Link>
        <Link className="btn-o" href="/">
          Back to home
        </Link>
      </div>
    </div>
  )
}
