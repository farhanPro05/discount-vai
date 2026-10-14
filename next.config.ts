import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // No framework branding: drop the "X-Powered-By: Next.js" header and the dev-mode badge.
  poweredByHeader: false,
  devIndicators: false,
  // Our own 404 for addresses that match no route (instead of the framework default).
  experimental: { globalNotFound: true },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const withAdmin = withPayload(nextConfig, { devBundleServerPackages: false })
const payloadHeaders = withAdmin.headers

export default {
  ...withAdmin,
  // Payload asks every browser for a colour-scheme hint (for the admin's light/dark theme). Its Critical-CH header
  // makes Chrome re-request the first page of every visit to send it (~0.6 s), so keep it to the admin only.
  headers: async () => {
    const rules = (await payloadHeaders?.()) ?? []
    return [
      ...rules.map((rule) =>
        rule.source === '/:path*' && rule.headers.some((h) => h.key === 'Critical-CH') ? { ...rule, source: '/admin/:path*' } : rule,
      ),
      // Basic protection on every page: no framing by other sites, no MIME sniffing, a modest referrer.
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Uploaded SVGs (e.g. a logo) still show as images, but any script inside one can't run if opened directly.
      {
        source: '/api/media/file/:file*',
        headers: [{ key: 'Content-Security-Policy', value: "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox" }],
      },
    ]
  },
} satisfies NextConfig
