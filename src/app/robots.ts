import type { MetadataRoute } from 'next'

import { SITE_URL } from '../lib/format'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/cart', '/checkout', '/account', '/order/', '/payment/', '/search', '/track-order', '/invoice/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
