import type { GlobalConfig } from 'payload'

import { anyone, staffOnly } from '../access'
import { ICON_OPTIONS } from './options'

export const Popup: GlobalConfig = {
  slug: 'popup',
  label: 'Email pop-up',
  admin: {
    group: 'Content',
    description:
      'The "Join the Vai List" pop-up. It appears once per visit after the visitor scrolls down, never on cart or checkout, and stays hidden for a few days after someone closes it.',
  },
  access: { read: anyone, update: staffOnly },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Show the pop-up' },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Text',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'eyebrow', type: 'text', admin: { width: '50%' } },
                { name: 'heading', type: 'text', admin: { width: '50%' } },
              ],
            },
            { name: 'text', type: 'textarea' },
            {
              name: 'offer',
              type: 'text',
              label: 'Offer line',
              admin: { description: 'e.g. "10% off your first order". Leave empty to hide the dashed offer box.' },
            },
            { name: 'buttonLabel', type: 'text', defaultValue: 'Join the Vai List' },
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Lifestyle photo' },
            { name: 'benefitsHeading', type: 'text', defaultValue: 'Be the first to know' },
            {
              name: 'benefits',
              type: 'array',
              maxRows: 3,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'icon', type: 'select', options: [...ICON_OPTIONS], defaultValue: 'bell', admin: { width: '40%' } },
                    { name: 'label', type: 'text', required: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'After signing up',
          fields: [
            { name: 'successHeading', type: 'text', defaultValue: "You're on the list!" },
            { name: 'successText', type: 'textarea' },
            {
              name: 'code',
              type: 'text',
              label: 'Discount code to show',
              admin: { description: 'Optional. Create the same code under Shop → Discount codes so it works at checkout.' },
            },
          ],
        },
        {
          label: 'When it appears',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'scrollPercent', type: 'number', defaultValue: 70, min: 10, max: 100, label: 'After scrolling (%)', admin: { width: '33%' } },
                { name: 'delaySeconds', type: 'number', defaultValue: 8, min: 0, label: 'Not before (seconds)', admin: { width: '33%' } },
                { name: 'hideDays', type: 'number', defaultValue: 7, min: 1, label: 'Hide after closing (days)', admin: { width: '34%' } },
              ],
            },
          ],
        },
      ],
    },
  ],
}
