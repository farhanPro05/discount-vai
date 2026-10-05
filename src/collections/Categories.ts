import type { CollectionConfig } from 'payload'

import { anyone, staffOnly } from '../access'
import { seoField } from '../fields/seo'
import { shapeField } from '../fields/shapes'
import { slugField } from '../fields/slug'
import { redirectOnSlugChange } from '../hooks/redirectOnSlugChange'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  defaultSort: 'order',
  admin: {
    group: 'Catalogue',
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'status', 'order'],
    description:
      'Top-level categories (Men, Women, Accessories) appear in the main menu. Set a category to "Coming Soon" to show a SOON badge and a sign-up page instead of products.',
  },
  access: { read: anyone, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: { afterChange: [redirectOnSlugChange('categories')] },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Shown in menus, e.g. "2/4 Pants".' } },
    slugField('name'),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'live',
      options: [
        { label: 'Live', value: 'live' },
        { label: 'Coming Soon', value: 'soon' },
        { label: 'Hidden', value: 'hidden' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      admin: { position: 'sidebar', description: 'Leave empty for a top-level category.' },
      // A category can't be its own parent. (No id yet while creating.)
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Lower numbers come first in menus.' },
    },
    {
      name: 'menuGroup',
      type: 'select',
      label: 'Mega menu column',
      options: [
        { label: 'Bottoms', value: 'bottoms' },
        { label: 'Tops & Outerwear', value: 'tops' },
        { label: 'Traditional', value: 'traditional' },
      ],
      admin: { position: 'sidebar', description: 'For subcategories of Men: which column of the menu they sit in.' },
    },
    shapeField('Shown on category tiles until a photo is uploaded.'),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Page',
          fields: [
            { name: 'heading', type: 'text', admin: { description: 'Page heading, e.g. "Men\'s Clothing". Uses the name if empty.' } },
            { name: 'tileText', type: 'text', label: 'Tile subtitle', admin: { description: 'Short line under the name on homepage tiles, e.g. "Chinos and twills".' } },
            { name: 'intro', type: 'textarea', admin: { description: 'One or two sentences under the heading.' } },
            { name: 'introMore', type: 'textarea', label: 'Intro, "Read more" part' },
            { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Used on homepage tiles and menus.' } },
            { name: 'faqTitle', type: 'text', label: 'FAQ heading' },
            {
              name: 'faqs',
              type: 'array',
              label: 'FAQ',
              labels: { singular: 'Question', plural: 'Questions' },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Coming Soon page',
          description: 'Used while the status is "Coming Soon".',
          fields: [
            { name: 'soonHeading', type: 'text', label: 'Heading', admin: { placeholder: "Women's collection is coming soon" } },
            { name: 'soonText', type: 'textarea', label: 'Teaser text' },
            { name: 'soonImage', type: 'upload', relationTo: 'media', label: 'Campaign image' },
          ],
        },
        { label: 'Search & sharing', fields: [seoField] },
      ],
    },
  ],
}
