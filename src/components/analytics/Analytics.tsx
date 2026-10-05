'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useRef } from 'react'

/** Loads Google Analytics 4 and the Meta Pixel when their IDs are set in the admin (Header, footer & contact → Analytics). */
export function Analytics({ ga, pixel }: { ga: string | null; pixel: string | null }) {
  const pathname = usePathname()
  const first = useRef(true)

  // GA4 counts page changes by itself (enhanced measurement); the Pixel needs a nudge on each new page.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    ;(window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.('track', 'PageView')
  }, [pathname])

  return (
    <>
      {ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      ) : null}
      {pixel ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  )
}
