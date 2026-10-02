import type { CollectionConfig } from 'payload'

import { hiddenFromStaff, isOwner, isStaff } from '../access'

export const DiscountCodes: CollectionConfig = {
  slug: 'discount-codes',
  labels: { singular: 'Discount code', plural: 'Discount codes' },
  admin: {
    group: 'Shop',
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'used', 'active', 'expiresAt'],
    hidden: hiddenFromStaff,
  },
  access: {
    read: ({ req }) => isStaff(req),
    create: ({ req }) => isOwner(req),
    update: ({ req }) => isOwner(req),
    delete: ({ req }) => isOwner(req),
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'What customers type at checkout, e.g. VAI10. Not case-sensitive.' },
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value)] },
    },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'percent',
          options: [
            { label: 'Percent off', value: 'percent' },
            { label: 'Fixed amount off (৳)', value: 'fixed' },
          ],
          admin: { width: '50%' },
        },
        { name: 'value', type: 'number', required: true, min: 0, admin: { width: '50%', description: 'e.g. 10 for 10% or ৳10' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'minOrder', type: 'number', min: 0, label: 'Minimum order (৳)', admin: { width: '50%' } },
        { name: 'expiresAt', type: 'date', label: 'Expires', admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'usageLimit', type: 'number', min: 0, label: 'Usage limit', admin: { width: '50%', description: 'Leave empty for unlimited.' } },
        { name: 'used', type: 'number', defaultValue: 0, label: 'Times used', admin: { width: '50%', readOnly: true } },
      ],
    },
  ],
}
