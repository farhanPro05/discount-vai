import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactForm } from '../../../../components/content/ContactForm'
import { Icon } from '../../../../components/ui/Icon'
import { isPlaceholder, waLink } from '../../../../lib/format'
import { getSite } from '../../../../lib/settings'

export const metadata: Metadata = {
  title: 'Contact us',
  description: 'Questions about sizes, orders or exchanges? Message Discount Vai on WhatsApp, call us, or send a message. We reply every day.',
  alternates: { canonical: '/contact' },
}

type Props = { searchParams: Promise<{ topic?: string; order?: string }> }

export default async function ContactPage({ searchParams }: Props) {
  const { topic, order } = await searchParams
  const site = await getSite()
  const chat = waLink(site.whatsapp, 'Hi Discount Vai!')
  const phone = site.phone?.trim()
  const cards = [
    phone
      ? {
          icon: 'phone' as const,
          title: 'Call us',
          text: phone,
          href: isPlaceholder(phone) ? null : `tel:${phone.replace(/[^\d+]/g, '')}`,
        }
      : null,
    chat ? { icon: 'whatsapp' as const, title: 'WhatsApp', text: 'Fastest reply, usually within an hour', href: chat } : null,
    site.email ? { icon: 'mail' as const, title: 'Email', text: site.email, href: `mailto:${site.email}` } : null,
    site.facebook ? { icon: 'facebook' as const, title: 'Facebook', text: 'Message our page', href: site.messenger || site.facebook } : null,
  ].filter((c): c is NonNullable<typeof c> => !!c)

  return (
    <div className="wrap pg-pad">
      <nav className="bc" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="cur" aria-current="page">
          Contact
        </span>
      </nav>
      <h1 className="pg-h1">Get in touch</h1>
      <p className="lead" style={{ maxWidth: 720 }}>
        Questions about sizes, orders or exchanges? We reply {chat ? 'on WhatsApp within an hour' : 'within a few hours'}, {site.hours?.toLowerCase() || 'every day from 9 am to 10 pm'}.
      </p>
      <div className="contact-l">
        <ContactForm topic={topic} order={order} />
        <div className="cards-c">
          {cards.map((c) =>
            c.href ? (
              <a key={c.title} className="cc-c" href={c.href} {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <Icon name={c.icon} />
                <span>
                  <b>{c.title}</b>
                  {c.text}
                </span>
              </a>
            ) : (
              <div key={c.title} className="cc-c">
                <Icon name={c.icon} />
                <span>
                  <b>{c.title}</b>
                  {c.text}
                </span>
              </div>
            ),
          )}
          {site.hours ? (
            <p className="muted sm">
              <Icon name="clock" small /> {site.hours}
            </p>
          ) : null}
          <p className="muted sm">
            Looking for an order? <Link className="lnk" href="/track-order">Track it here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
