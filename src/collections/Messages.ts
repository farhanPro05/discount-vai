import type { CollectionConfig } from 'payload'

import { isOwner, isStaff } from '../access'

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Contact message', plural: 'Contact messages' },
  defaultSort: '-createdAt',
  admin: {
    group: 'Shop',
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'topic', 'status', 'createdAt'],
    description: 'Messages sent from the Contact page.',
  },
  access: {
    read: ({ req }) => isStaff(req),
    create: ({ req }) => isStaff(req),
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isOwner(req),
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'phone', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', admin: { width: '50%' } },
        { name: 'orderNumber', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'topic', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Replied', value: 'replied' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
