import type { Metadata } from 'next'
import Link from 'next/link'

import { CheckoutForm } from '../../../components/shop/CheckoutForm'
import { Wordmark } from '../../../components/ui/Art'
import { Icon } from '../../../components/ui/Icon'
import { getCustomer } from '../../../lib/customer'
import { isPlaceholder } from '../../../lib/format'
import { toImg } from '../../../lib/media'
import { getBrand, getCommerceInfo, getSite } from '../../../lib/settings'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } }

export default async function CheckoutPage() {
  const [commerce, customer, site, brand] = await Promise.all([getCommerceInfo(), getCustomer(), getSite(), getBrand()])
  const addr = customer?.addresses?.[0]
  const phone = customer?.username && /^01\d{9}$/.test(customer.username) ? customer.username : ''
  return (
    <>
      <header className="hdr">
        <div className="wrap co-hdr-in">
          <Wordmark logo={toImg(brand.logo)} />
          <span className="co-sec">
            <Icon name="lock" small />
            Secure checkout
          </span>
          <Link className="lnk" href="/cart">
            Back to cart
          </Link>
        </div>
      </header>
      <main id="main" className="wrap co">
        <CheckoutForm
          commerce={commerce}
          prefill={{
            name: customer?.name ?? '',
            phone,
            email: customer?.email ?? '',
            district: addr?.district ?? undefined,
            area: addr?.area ?? '',
            address: addr?.line ?? '',
          }}
        />
      </main>
      <footer className="co-ft">
        <div className="wrap co-ft-in">
          <span>© {new Date().getFullYear()} Discount Vai</span>
          {site.phone ? <span>Need help? Call {isPlaceholder(site.phone) ? site.phone : <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`}>{site.phone}</a>}</span> : null}
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/returns-exchange">Returns &amp; Exchange</Link>
        </div>
      </footer>
    </>
  )
}
