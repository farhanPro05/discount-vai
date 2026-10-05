import type { Metadata } from 'next'
import { Archivo, Hanken_Grotesk } from 'next/font/google'

import '../../styles/tokens.css'
import './print.css'

import { getBrand } from '../../lib/settings'

/* Printable staff pages (invoices). No shop header, footer or pop-up. */
const display = Archivo({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--font-archivo', display: 'swap' })
const body = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-hanken', display: 'swap' })

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
}

export const dynamic = 'force-dynamic'

export default async function PrintLayout({ children }: { children: React.ReactNode }) {
  const palette = await getBrand()
    .then((b) => b.palette)
    .catch(() => 'sage')
  return (
    <html lang="en" data-palette={palette ?? 'sage'} className={`${display.variable} ${body.variable}`}>
      <body className="pr">{children}</body>
    </html>
  )
}
