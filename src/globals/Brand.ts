import type { GlobalConfig } from 'payload'

import { anyone, hiddenFromStaff, ownerOnly } from '../access'

export const PALETTES = [
  { label: 'Sage & Sand (default)', value: 'sage' },
  { label: 'Harbour', value: 'harbour' },
  { label: 'Clay & Stone', value: 'clay' },
  { label: 'Olive & Ivory', value: 'olive' },
] as const

export type PaletteKey = (typeof PALETTES)[number]['value']

export const Brand: GlobalConfig = {
  slug: 'brand',
  label: 'Brand settings',
  admin: {
    group: 'Settings',
    hidden: hiddenFromStaff,
    description: 'Logo, favicon and the colour palette used across the whole website.',
  },
  access: { read: anyone, update: ownerOnly },
  fields: [
    {
      name: 'palette',
      type: 'select',
      required: true,
      defaultValue: 'sage',
      options: [...PALETTES],
      admin: { description: 'Changes every colour on the website at once.' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional. Until a logo is uploaded, the text wordmark "Discount Vai" is shown. A wide SVG or PNG works best.' },
    },
    {
      name: 'logoOnDark',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo for dark backgrounds',
      admin: { description: 'Used in the footer. Falls back to the text wordmark.' },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Square image, at least 512 × 512. The "DV" monogram is used until one is uploaded.' },
    },
  ],
}
