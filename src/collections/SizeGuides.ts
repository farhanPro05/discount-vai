import type { CollectionConfig } from 'payload'

import { anyone, staffOnly } from '../access'

export const SizeGuides: CollectionConfig = {
  slug: 'size-guides',
  labels: { singular: 'Size guide', plural: 'Size guides' },
  admin: {
    group: 'Catalogue',
    useAsTitle: 'name',
    description: 'Size charts shown in the "Size Guide" pop-up on product pages. Enter measurements in inches; centimetres are worked out automatically.',
  },
  access: { read: anyone, create: staffOnly, update: staffOnly, delete: staffOnly },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { placeholder: 'Panjabi' } },
    {
      name: 'columns',
      type: 'text',
      required: true,
      admin: { description: 'Measurement names separated by commas.', placeholder: 'Chest, Length, Shoulder, Sleeve' },
    },
    {
      name: 'rows',
      type: 'array',
      labels: { singular: 'Size', plural: 'Sizes' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'size', type: 'text', required: true, admin: { width: '30%' } },
            {
              name: 'values',
              type: 'text',
              required: true,
              label: 'Measurements (inches)',
              admin: { width: '70%', placeholder: '40, 41, 17.5, 23.5', description: 'Same order as the columns, separated by commas.' },
            },
          ],
        },
      ],
    },
    {
      name: 'howToMeasure',
      type: 'array',
      labels: { singular: 'Step', plural: 'How to measure' },
      fields: [
        { name: 'label', type: 'text', required: true, admin: { placeholder: 'Chest' } },
        { name: 'text', type: 'text', required: true },
      ],
    },
    { name: 'tip', type: 'text', admin: { placeholder: 'Between sizes? Go one up for a relaxed fit.' } },
  ],
}
