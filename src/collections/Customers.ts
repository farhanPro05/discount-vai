import type { CollectionConfig } from 'payload'

import { isOwner, isStaff } from '../access'

/** Shoppers' accounts. They log in on the website (phone or email), never in the admin panel. */
export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Customer', plural: 'Customers' },
  admin: {
    group: 'Shop',
    useAsTitle: 'name',
    defaultColumns: ['name', 'username', 'email', 'createdAt'],
  },
  auth: {
    loginWithUsername: { allowEmailLogin: true, requireEmail: false, requireUsername: true },
    tokenExpiration: 60 * 60 * 24 * 30,
    cookies: { sameSite: 'Lax' },
    useAPIKey: false,
  },
  access: {
    admin: () => false,
    read: ({ req }) => (isStaff(req) ? true : req.user?.collection === 'customers' ? { id: { equals: req.user.id } } : false),
    create: () => true,
    update: ({ req }) => (isStaff(req) ? true : req.user?.collection === 'customers' ? { id: { equals: req.user.id } } : false),
    delete: ({ req }) => isOwner(req),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'addresses',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', admin: { placeholder: 'Home' } },
        { name: 'district', type: 'text' },
        { name: 'area', type: 'text' },
        { name: 'line', type: 'textarea' },
      ],
    },
  ],
}
