import type { CollectionConfig } from 'payload'

import { anyone, staffOnly } from '../access'
import { shapeField } from '../fields/shapes'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Customer review', plural: 'Customer reviews' },
  defaultSort: 'order',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'productName', 'rating', 'featured'],
    description: 'Featured reviews appear in "What our customers say" on the homepage.',
  },
  access: { read: anyone, create: staffOnly, update: staffOnly, delete: staffOnly },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'city', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    { name: 'quote', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        { name: 'productName', type: 'text', label: 'Product bought', admin: { width: '50%' } },
        { name: 'rating', type: 'number', min: 1, max: 5, defaultValue: 5, required: true, admin: { width: '50%' } },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Customer photo' },
    { name: 'featured', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    shapeField('Shown until a customer photo is uploaded.'),
  ],
}
