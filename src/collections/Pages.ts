import type { Block, CollectionConfig } from 'payload'

import { anyone, staffOnly } from '../access'
import { seoField } from '../fields/seo'
import { slugField } from '../fields/slug'
import { redirectOnSlugChange } from '../hooks/redirectOnSlugChange'

const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Text', plural: 'Text' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'richText' },
  ],
}

const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
}

const CardsBlock: Block = {
  slug: 'cards',
  labels: { singular: 'Highlight cards', plural: 'Highlight cards' },
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'values',
      options: [
        { label: 'Tinted cards (e.g. our values)', value: 'values' },
        { label: 'Big numbers (e.g. 7 days)', value: 'facts' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'text' },
      ],
    },
  ],
}

const StepsBlock: Block = {
  slug: 'steps',
  labels: { singular: 'Numbered steps', plural: 'Numbered steps' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'bold', type: 'text', label: 'Bold start' },
        { name: 'text', type: 'text', required: true },
      ],
    },
  ],
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  defaultSort: 'navOrder',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'showInHelpNav'],
    description: 'About, policies and other information pages.',
  },
  access: { read: anyone, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: { afterChange: [redirectOnSlugChange('pages')] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'lead', type: 'textarea', label: 'Intro paragraph' },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page content',
      blocks: [TextBlock, ImageBlock, CardsBlock, StepsBlock],
    },
    { name: 'showInHelpNav', type: 'checkbox', defaultValue: true, label: 'Show in the help side menu', admin: { position: 'sidebar' } },
    { name: 'navLabel', type: 'text', label: 'Side menu label', admin: { position: 'sidebar' } },
    { name: 'navOrder', type: 'number', defaultValue: 10, label: 'Side menu order', admin: { position: 'sidebar' } },
    seoField,
  ],
}
