import type { GlobalConfig } from 'payload'

import { anyone, staffOnly } from '../access'
import { HOME_SECTIONS } from './homeSections'
import { ICON_OPTIONS } from './options'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Homepage',
  admin: { group: 'Content', description: 'Everything on the homepage. Drag the rows in "Section order" to rearrange sections, or remove a row to hide that section.' },
  access: { read: anyone, update: staffOnly },
  fields: [
    {
      name: 'sections',
      type: 'array',
      label: 'Section order',
      admin: { initCollapsed: true, components: { RowLabel: '/admin/SectionRowLabel#SectionRowLabel' } },
      fields: [{ name: 'section', type: 'select', required: true, options: [...HOME_SECTIONS] }],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'slides',
              type: 'array',
              maxRows: 5,
              labels: { singular: 'Slide', plural: 'Slides' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'eyebrow', type: 'text', admin: { width: '50%' } },
                    { name: 'heading', type: 'text', required: true, admin: { width: '50%' } },
                  ],
                },
                { name: 'text', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'ctaLabel', type: 'text', label: 'Button label', admin: { width: '50%' } },
                    { name: 'ctaLink', type: 'text', label: 'Button link', admin: { width: '50%', placeholder: '/men/panjabi' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'imageDesktop',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Desktop image',
                      admin: { width: '50%', description: 'Wide, about 2880 × 1200. Keep the subject on the right.' },
                    },
                    {
                      name: 'imageMobile',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Mobile image',
                      admin: { width: '50%', description: 'Portrait, about 780 × 1120. Keep the subject at the top.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Products',
          fields: [
            { name: 'categoriesHeading', type: 'text', defaultValue: 'Shop by Category' },
            {
              name: 'newArrivals',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text', defaultValue: 'New Arrivals' },
                { name: 'count', type: 'number', defaultValue: 8, min: 4, max: 16, admin: { description: 'Newest products are shown automatically.' } },
              ],
            },
            {
              name: 'bestSellers',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text', defaultValue: "Vai's Best Sellers" },
                {
                  name: 'products',
                  type: 'relationship',
                  relationTo: 'products',
                  hasMany: true,
                  admin: { description: 'Pick products, or leave empty to show products marked "Best seller".' },
                },
              ],
            },
          ],
        },
        {
          label: 'Deal banner',
          fields: [
            {
              name: 'deal',
              type: 'group',
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
                  name: 'endsAt',
                  type: 'date',
                  label: 'Countdown ends',
                  admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'The banner hides itself after this time. Leave empty for no countdown.' },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'ctaLabel', type: 'text', label: 'Button label', admin: { width: '50%' } },
                    { name: 'ctaLink', type: 'text', label: 'Button link', admin: { width: '50%', placeholder: '/sale' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Featured collection',
          fields: [
            {
              name: 'featured',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'heading', type: 'text', admin: { width: '50%' } },
                    { name: 'link', type: 'text', admin: { width: '50%', placeholder: '/men/panjabi' } },
                  ],
                },
                { name: 'linkLabel', type: 'text', defaultValue: 'Shop the collection' },
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Lifestyle image' },
                {
                  type: 'row',
                  fields: [
                    { name: 'eyebrow', type: 'text', label: 'Image eyebrow', admin: { width: '50%' } },
                    { name: 'title', type: 'text', label: 'Image title', admin: { width: '50%' } },
                  ],
                },
                { name: 'text', type: 'text', label: 'Image text' },
                { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true, maxRows: 4 },
              ],
            },
          ],
        },
        {
          label: 'Bags spotlight',
          fields: [
            {
              name: 'bags',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'eyebrow', type: 'text', admin: { width: '50%' } },
                    { name: 'heading', type: 'text', admin: { width: '50%' } },
                  ],
                },
                { name: 'text', type: 'textarea' },
                { name: 'image', type: 'upload', relationTo: 'media' },
                {
                  name: 'chips',
                  type: 'array',
                  label: 'Quick links',
                  maxRows: 6,
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
                        { name: 'link', type: 'text', required: true, admin: { width: '50%' } },
                      ],
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'ctaLabel', type: 'text', label: 'Button label', admin: { width: '50%' } },
                    { name: 'ctaLink', type: 'text', label: 'Button link', admin: { width: '50%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Women's teaser",
          fields: [
            {
              name: 'womenTeaser',
              type: 'group',
              fields: [
                { name: 'pill', type: 'text', defaultValue: 'Coming soon' },
                { name: 'heading', type: 'text' },
                { name: 'text', type: 'textarea' },
                { name: 'linkLabel', type: 'text' },
                { name: 'link', type: 'text', defaultValue: '/women' },
              ],
            },
          ],
        },
        {
          label: 'Trust & reviews',
          fields: [
            {
              name: 'trust',
              type: 'array',
              label: 'Trust strip',
              maxRows: 4,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'icon', type: 'select', options: [...ICON_OPTIONS], defaultValue: 'exchange', admin: { width: '30%' } },
                    { name: 'title', type: 'text', required: true, admin: { width: '35%' } },
                    { name: 'subtitle', type: 'text', admin: { width: '35%' } },
                  ],
                },
              ],
            },
            {
              name: 'reviews',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text', defaultValue: 'What our customers say' },
                { name: 'ratingText', type: 'text', admin: { placeholder: '4.8 / 5 from 1,240 reviews' } },
              ],
            },
          ],
        },
        {
          label: 'About text',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: 'About Discount Vai (bottom of the page)',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'text', type: 'textarea' },
                { name: 'more', type: 'textarea', label: '"Read more" part' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
