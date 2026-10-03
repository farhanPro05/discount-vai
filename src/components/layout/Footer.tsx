import Link from 'next/link'

import { getNav } from '../../lib/catalog'
import { toImg } from '../../lib/media'
import { getBrand, getSite } from '../../lib/settings'
import { NewsletterForm } from '../shop/NewsletterForm'
import { Wordmark } from '../ui/Art'
import { SocialIcons } from './HeaderClient'

export async function Footer() {
  const [site, brand, nav] = await Promise.all([getSite(), getBrand(), getNav()])
  const pays = (site.paymentLabels || 'Cash on Delivery, bKash, Nagad, Visa, Mastercard')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const socials = {
    facebook: site.facebook || null,
    instagram: site.instagram || null,
    tiktok: site.tiktok || null,
    whatsapp: site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}` : null,
  }
  return (
    <footer className="ft">
      <div className="wrap ft-grid">
        <div className="ft-brand">
          <Wordmark logo={toImg(brand.logoOnDark)} />
          {site.promise ? <p className="ft-promise">{site.promise}</p> : null}
          <NewsletterForm source="footer" variant="footer" label={site.newsletterLabel || 'New drops and members-only deals, straight to your inbox'} />
          <SocialIcons socials={socials} className="ft-soc" />
        </div>
        <nav className="ft-col" aria-label="Shop">
          <p className="ft-h">Shop</p>
          {nav.map((top) => (
            <Link key={top.id} href={top.href}>
              {top.label}
              {top.soon ? <span className="soon">Soon</span> : null}
            </Link>
          ))}
          <Link href="/new-arrivals">New Arrivals</Link>
          <Link href="/sale">Sale</Link>
        </nav>
        <nav className="ft-col" aria-label="Help">
          <p className="ft-h">Help</p>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/size-guide">Size Guide</Link>
          <Link href="/shipping-delivery">Shipping &amp; Delivery</Link>
          <Link href="/returns-exchange">Returns &amp; Exchange</Link>
          <Link href="/track-order">Track Order</Link>
        </nav>
        <nav className="ft-col" aria-label="Company">
          <p className="ft-h">Company</p>
          <Link href="/about">About</Link>
          <Link href="/style-guide">
            Style Guide <span className="soon">Soon</span>
          </Link>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
      <div className="wrap ft-bot">
        <div className="pay">
          <span className="ft-l">We accept</span>
          {pays.map((p) => (
            <span key={p} className="pill">
              {p}
            </span>
          ))}
        </div>
        <p className="copy">© {new Date().getFullYear()} Discount Vai. All rights reserved.</p>
      </div>
    </footer>
  )
}
