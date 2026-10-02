import type { GlobalConfig } from 'payload'

import { anyone, staffOnly } from '../access'

export const Faq: GlobalConfig = {
  slug: 'faq',
  label: 'FAQ page',
  admin: { group: 'Content' },
  access: { read: anyone, update: staffOnly },
  fields: [
    { name: 'lead', type: 'textarea', label: 'Intro paragraph' },
    {
      name: 'groups',
      type: 'array',
      labels: { singular: 'Group', plural: 'Groups' },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'questions',
          type: 'array',
          fields: [
            { name: 'question', type: 'text', required: true },
            { name: 'answer', type: 'textarea', required: true },
          ],
        },
      ],
    },
  ],
}
