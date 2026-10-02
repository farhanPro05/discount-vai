import type { CollectionConfig } from 'payload'

import { hiddenFromStaff, isOwner, isStaff } from '../access'

/** People who can log in to the admin panel. Customers have their own collection. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Admin user', plural: 'Admin users' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
    hidden: hiddenFromStaff,
  },
  auth: true,
  access: {
    admin: ({ req }) => isStaff(req),
    read: ({ req }) => (isOwner(req) ? true : isStaff(req) ? { id: { equals: req.user?.id } } : false),
    create: ({ req }) => isOwner(req),
    update: ({ req }) => (isOwner(req) ? true : isStaff(req) ? { id: { equals: req.user?.id } } : false),
    delete: ({ req }) => isOwner(req),
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      saveToJWT: true,
      options: [
        { label: 'Owner (everything)', value: 'owner' },
        { label: 'Staff (products and orders)', value: 'staff' },
      ],
      access: { update: ({ req }) => isOwner(req) },
    },
  ],
}
