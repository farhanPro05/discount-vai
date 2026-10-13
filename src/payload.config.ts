import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { isOwner, isStaff } from './access'
import { Categories } from './collections/Categories'
import { Customers } from './collections/Customers'
import { DiscountCodes } from './collections/DiscountCodes'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Products } from './collections/Products'
import { Reviews } from './collections/Reviews'
import { SizeGuides } from './collections/SizeGuides'
import { Subscribers } from './collections/Subscribers'
import { Users } from './collections/Users'
import { Brand } from './globals/Brand'
import { Commerce } from './globals/Commerce'
import { Faq } from './globals/Faq'
import { Home } from './globals/Home'
import { Popup } from './globals/Popup'
import { Site } from './globals/Site'
import { releaseUnpaidOrders } from './jobs/releaseUnpaidOrders'

const filename = fileURLToPath(import.meta.url)

/** The site's own address, with and without www: admin cookies are only accepted from these (CSRF). */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
const siteOrigins = [SITE, SITE.includes('://www.') ? SITE.replace('://www.', '://') : SITE.replace('://', '://www.')]
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: SITE,
  csrf: siteOrigins,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · Discount Vai admin',
      description: 'Discount Vai shop admin',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    components: {
      graphics: {
        Logo: '/admin/Logo#Logo',
        Icon: '/admin/Icon#Icon',
      },
    },
  },
  collections: [Products, Categories, SizeGuides, Media, Orders, Customers, Subscribers, DiscountCodes, Messages, Pages, Reviews, Users],
  globals: [Home, Popup, Faq, Brand, Site, Commerce],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  graphQL: { disable: true },
  // Uploads above 15 MB are refused (product photos should be far smaller; see the Media help text).
  upload: { limits: { fileSize: 15_000_000 } },
  // Background jobs (scheduled publishing) run every minute on the server. Only staff may queue or run them.
  jobs: {
    autoRun: [{ cron: '* * * * *', queue: 'default' }],
    tasks: [releaseUnpaidOrders],
    access: {
      queue: ({ req }) => isStaff(req),
      run: ({ req }) => isStaff(req),
      cancel: ({ req }) => isStaff(req),
    },
  },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  sharp,
  // Without SMTP settings Payload prints emails to the server log instead of sending them.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM || process.env.SMTP_USER || '',
        defaultFromName: 'Discount Vai',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  plugins: [
    redirectsPlugin({
      collections: ['products', 'categories', 'pages'],
      overrides: {
        admin: { group: 'Settings', description: 'Old web addresses that forward to new ones. Added automatically when a URL slug changes.' },
        access: { read: () => true, create: ({ req }) => isStaff(req), update: ({ req }) => isStaff(req), delete: ({ req }) => isOwner(req) },
      },
    }),
    importExportPlugin({
      collections: [
        { slug: 'subscribers', import: false, export: { format: 'csv', disableJobsQueue: true } },
        { slug: 'orders', import: false, export: { format: 'csv', disableJobsQueue: true } },
      ],
    }),
  ],
})
