import type { CollectionConfig } from 'payload'

import { isOwner, isStaff } from '../access'

export const SUBSCRIBER_SOURCES = [
  { label: 'Email pop-up', value: 'popup' },
  { label: 'Footer form', value: 'footer' },
  { label: 'Homepage women teaser', value: 'home-teaser' },
  { label: 'Coming Soon page', value: 'coming-soon' },
  { label: 'Checkout', value: 'checkout' },
  { label: 'Account sign-up', value: 'account' },
] as const

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Subscriber', plural: 'Subscribers' },
  defaultSort: '-createdAt',
  admin: {
    group: 'Shop',
    useAsTitle: 'email',
    defaultColumns: ['email', 'source', 'interest', 'createdAt'],
    description: 'Everyone who joined the Vai List. Use the Export button to download them as a CSV file.',
  },
  access: {
    read: ({ req }) => isStaff(req),
    create: ({ req }) => isStaff(req),
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isOwner(req),
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'source', type: 'select', required: true, defaultValue: 'popup', options: [...SUBSCRIBER_SOURCES] },
    {
      name: 'interest',
      type: 'text',
      admin: { description: 'What they asked to hear about, e.g. "women" for the Women Coming Soon page.' },
    },
  ],
}
