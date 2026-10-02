import { postgresAdapter } from '@payloadcms/db-postgres'
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
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
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  sharp,
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
