import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { publishedOrStaff, staffOnly } from '../access'
import { seoField } from '../fields/seo'
import { shapeField } from '../fields/shapes'
import { slugField } from '../fields/slug'
import { redirectOnSlugChange } from '../hooks/redirectOnSlugChange'

type ColourRow = { name?: string | null; sizes?: { size?: string | null; stock?: number | null }[] | null }

/** Keep the hidden helper fields (used for sorting and filtering) in step with what the owner typed. */
const computeHelpers: CollectionBeforeChangeHook = ({ data }) => {
  const price = Number(data.price) || 0
  const sale = data.salePrice != null && data.salePrice !== '' ? Number(data.salePrice) : null
  const onSale = sale != null && sale > 0 && sale < price
  const colours = (data.colours ?? []) as ColourRow[]
  const sizes = new Set<string>()
  let stock = 0
  for (const c of colours) {
    for (const s of c.sizes ?? []) {
      const n = Number(s.stock) || 0
      stock += n
      if (n > 0 && s.size) sizes.add(s.size)
    }
  }
  return {
    ...data,
    effectivePrice: onSale ? sale : price,
    onSale,
    discountPercent: onSale ? Math.round((1 - (sale as number) / price) * 100) : 0,
    totalStock: stock,
    availableSizes: [...sizes],
    colourNames: colours.map((c) => c.name).filter(Boolean),
  }
}

const hidden = { readOnly: true, position: 'sidebar' as const, hidden: true }

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Product', plural: 'Products' },
  admin: {
    group: 'Catalogue',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'salePrice', 'totalStock', '_status'],
    listSearchableFields: ['name', 'slug'],
    description: 'Each product can have several colours. Each colour has its own photos and stock per size.',
  },
  versions: { drafts: true },
  access: { read: publishedOrStaff, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: { beforeChange: [computeHelpers], afterChange: [redirectOnSlugChange('products')] },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'isNew',
      type: 'checkbox',
      label: 'Show "NEW" badge',
      admin: { position: 'sidebar' },
    },
    {
      name: 'isBestSeller',
      type: 'checkbox',
      label: 'Best seller',
      admin: { position: 'sidebar', description: 'Best sellers can be shown on the homepage.' },
    },
    shapeField('Shown on cards until photos are uploaded.'),
    {
      type: 'row',
      fields: [
        { name: 'price', type: 'number', required: true, min: 0, label: 'Price (৳)', admin: { width: '50%' } },
        {
          name: 'salePrice',
          type: 'number',
          min: 0,
          label: 'Sale price (৳)',
          admin: { width: '50%', description: 'Leave empty when not on sale. Must be lower than the price.' },
          validate: (value: number | null | undefined, { siblingData }: { siblingData: { price?: number } }) => {
            if (value == null) return true
            if (siblingData?.price != null && value >= siblingData.price) return 'Sale price must be lower than the price.'
            return true
          },
        },
      ],
    },
    {
      name: 'kicker',
      type: 'text',
      label: 'Small label above the name',
      admin: { placeholder: 'Panjabi · Regular fit' },
    },
    {
      name: 'colours',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Colour', plural: 'Colours' },
      admin: {
        description: 'Add one row per colour. The first colour is shown by default.',
        initCollapsed: false,
        components: { RowLabel: '/admin/ColourRowLabel#ColourRowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '50%', placeholder: 'White' } },
            {
              name: 'hex',
              type: 'text',
              required: true,
              label: 'Swatch colour',
              admin: { width: '50%', placeholder: '#F7F5F0', description: 'Hex code for the colour dot.' },
              validate: (value: string | null | undefined) =>
                !value || /^#[0-9a-fA-F]{6}$/.test(value) ? true : 'Use a hex code like #F7F5F0.',
            },
          ],
        },
        {
          name: 'images',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          label: 'Photos',
          admin: { description: 'Portrait 4:5 photos, e.g. 1200 × 1500. The first photo is the main one.' },
        },
        {
          name: 'sizes',
          type: 'array',
          labels: { singular: 'Size', plural: 'Sizes' },
          admin: { description: 'Stock for each size. Set stock to 0 when a size sells out.' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'size', type: 'text', required: true, admin: { width: '50%', placeholder: 'M' } },
                { name: 'stock', type: 'number', required: true, min: 0, defaultValue: 0, admin: { width: '50%' } },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Description',
          fields: [
            { name: 'description', type: 'textarea', admin: { rows: 5 } },
            {
              name: 'details',
              type: 'group',
              fields: [
                { name: 'fabric', type: 'text', admin: { placeholder: '100% combed cotton, 140 GSM' } },
                { name: 'fit', type: 'text', admin: { placeholder: 'Regular fit, knee length' } },
                { name: 'care', type: 'text', admin: { placeholder: 'Machine wash cold, dry in shade' } },
                { name: 'sku', type: 'text', label: 'SKU' },
              ],
            },
            { name: 'sizeGuide', type: 'relationship', relationTo: 'size-guides' },
            {
              name: 'searchTerms',
              type: 'text',
              label: 'Extra search words',
              admin: { description: 'Other words people might search for, e.g. "kurta, eid".' },
            },
          ],
        },
        { label: 'Search & sharing', fields: [seoField] },
      ],
    },
    // Helper fields filled in automatically (used for sorting and filters).
    { name: 'effectivePrice', type: 'number', index: true, admin: hidden },
    { name: 'onSale', type: 'checkbox', index: true, admin: hidden },
    { name: 'discountPercent', type: 'number', admin: hidden },
    { name: 'totalStock', type: 'number', label: 'Stock', admin: { ...hidden, hidden: false } },
    { name: 'availableSizes', type: 'text', hasMany: true, admin: hidden },
    { name: 'colourNames', type: 'text', hasMany: true, admin: hidden },
    { name: 'salesCount', type: 'number', defaultValue: 0, index: true, admin: { ...hidden, hidden: false, description: 'Units sold. Used for "Best selling".' } },
  ],
}
