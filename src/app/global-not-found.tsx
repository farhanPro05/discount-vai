import type { Metadata } from 'next'
import { Archivo, Hanken_Grotesk } from 'next/font/google'

import '../styles/globals.css'

import { DEFAULT_404_LINKS, NotFoundBody } from '../components/content/NotFoundBody'
import { Wordmark } from '../components/ui/Art'
import { getBrand } from '../lib/settings'

/* Shown for addresses that match no route at all. It skips the normal layout, so it loads its own fonts and styles. */
const display = Archivo({ subsets: ['latin'], weight: ['500', '800'], variable: '--font-archivo', display: 'swap' })
const body = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-hanken', display: 'swap' })

export const metadata: Metadata = {
  title: 'Page not found | Discount Vai',
  robots: { index: false, follow: true },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
}

export default async function GlobalNotFound() {
  const palette = await getBrand()
    .then((b) => b.palette)
    .catch(() => 'sage')
  return (
    <html lang="en" data-palette={palette ?? 'sage'} className={`${display.variable} ${body.variable}`}>
      <body>
        <header className="hdr">
          <div className="wrap" style={{ height: 64, display: 'flex', alignItems: 'center' }}>
            <Wordmark />
          </div>
        </header>
        <main id="main">
          <NotFoundBody links={DEFAULT_404_LINKS} />
        </main>
      </body>
    </html>
  )
}
