import type { Metadata, Viewport } from 'next'
import { Archivo, Hanken_Grotesk } from 'next/font/google'

import '../../styles/globals.css'

import { ShopProvider } from '../../components/shop/ShopProvider'
import { SITE_URL } from '../../lib/format'
import { toImg } from '../../lib/media'
import { getBrand } from '../../lib/settings'

/* Fonts are provisional; swap them here and in styles/tokens.css. */
const display = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-archivo', display: 'swap' })
const body = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-hanken',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  const favicon = toImg(brand.favicon)
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: 'Discount Vai | Men’s Clothing Online in Bangladesh', template: '%s | Discount Vai' },
    description:
      'Shop men’s trousers, shorts, drop-shoulder tees, club jerseys, jackets, Panjabi and unisex bags at fair prices. Cash on Delivery across Bangladesh and easy 7-day exchange.',
    applicationName: 'Discount Vai',
    icons: favicon
      ? { icon: favicon.url, apple: favicon.url }
      : { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }], apple: '/apple-touch-icon.png' },
    openGraph: { siteName: 'Discount Vai', locale: 'en_BD', type: 'website' },
    twitter: { card: 'summary_large_image' },
    formatDetection: { telephone: false },
  }
}

// Pages read live data from the admin, so always render fresh.
export const dynamic = 'force-dynamic'

// Pinch-zoom stays allowed (no maximum-scale / user-scalable=no).
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrand()
  return (
    <html lang="en" data-palette={brand.palette ?? 'sage'} className={`${display.variable} ${body.variable}`}>
      <body>
        <ShopProvider>{children}</ShopProvider>
      </body>
    </html>
  )
}
