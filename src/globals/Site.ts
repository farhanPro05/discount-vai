import type { Field, GlobalConfig } from 'payload'

import { anyone, hiddenFromStaff, ownerOnly } from '../access'

const featureTile = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', type: 'text', admin: { width: '50%' } },
        { name: 'title', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'linkLabel', type: 'text', defaultValue: 'Shop now', admin: { width: '50%' } },
        { name: 'link', type: 'text', admin: { width: '50%', placeholder: '/men/panjabi' } },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
})

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Header, footer & contact',
  admin: { group: 'Settings', hidden: hiddenFromStaff },
  access: { read: anyone, update: ownerOnly },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Header',
          fields: [
            {
              name: 'announcements',
              type: 'array',
              label: 'Announcement bar messages',
              maxRows: 3,
              admin: { description: 'The thin bar at the very top. Leave empty to hide it.' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            featureTile('menFeature', 'Men menu: featured tile'),
            featureTile('accessoriesFeature', 'Accessories menu: featured tile'),
          ],
        },
        {
          label: 'Footer',
          fields: [
            { name: 'promise', type: 'textarea', label: 'Brand promise' },
            { name: 'newsletterLabel', type: 'text', label: 'Newsletter line' },
            {
              name: 'paymentLabels',
              type: 'text',
              label: 'Payment methods shown',
              admin: { description: 'Separated by commas.', placeholder: 'Cash on Delivery, bKash, Nagad, Visa, Mastercard' },
            },
          ],
        },
        {
          label: 'Contact & social',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', admin: { width: '50%', placeholder: '01XXX-XXXXXX' } },
                {
                  name: 'whatsapp',
                  type: 'text',
                  label: 'WhatsApp number',
                  admin: { width: '50%', placeholder: '8801XXXXXXXXX', description: 'With country code, digits only.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', admin: { width: '50%' } },
                { name: 'hours', type: 'text', label: 'Opening hours', admin: { width: '50%', placeholder: 'Every day, 9 am to 10 pm' } },
              ],
            },
            { name: 'showWhatsAppButton', type: 'checkbox', defaultValue: true, label: 'Show the floating WhatsApp button' },
            {
              type: 'row',
              fields: [
                { name: 'facebook', type: 'text', label: 'Facebook page URL', admin: { width: '50%' } },
                { name: 'instagram', type: 'text', label: 'Instagram URL', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'tiktok', type: 'text', label: 'TikTok URL', admin: { width: '50%' } },
                { name: 'messenger', type: 'text', label: 'Messenger link', admin: { width: '50%', placeholder: 'https://m.me/yourpage' } },
              ],
            },
          ],
        },
        {
          label: 'Analytics',
          description: 'All optional. Leave a box empty to switch that service off. They only run on the live site, never in development.',
          fields: [
            {
              name: 'googleAnalyticsId',
              type: 'text',
              label: 'Google Analytics 4 measurement ID',
              admin: { placeholder: 'G-XXXXXXXXXX', description: 'Google Analytics → Admin → Data streams → your website.' },
              validate: (v: unknown) => !v || /^G-[A-Z0-9]{4,20}$/.test(String(v)) || 'It looks like G- followed by letters and numbers, e.g. G-AB12CD34EF.',
            },
            {
              name: 'googleVerification',
              type: 'text',
              label: 'Google Search Console verification code',
              admin: {
                description: 'Search Console → Settings → Ownership verification → HTML tag. Paste only the code inside content="…".',
              },
              validate: (v: unknown) => !v || /^[A-Za-z0-9_-]{10,100}$/.test(String(v)) || 'Paste only the code (letters, numbers, - and _), not the whole tag.',
            },
            {
              name: 'metaPixelId',
              type: 'text',
              label: 'Meta (Facebook) Pixel ID',
              admin: { placeholder: '123456789012345', description: 'Events Manager → Data sources → your Pixel. Tracks page views, add to cart, checkout and purchases.' },
              validate: (v: unknown) => !v || /^\d{8,20}$/.test(String(v)) || 'A Pixel ID is numbers only.',
            },
          ],
        },
      ],
    },
  ],
}
