import type { CollectionConfig } from 'payload'

import { anyone, staffOnly } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Media library' },
  admin: { group: 'Catalogue', useAsTitle: 'alt', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: { read: anyone, create: staffOnly, update: staffOnly, delete: staffOnly },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt text',
      admin: { description: 'Describe the photo for Google and screen readers, e.g. "White cotton Panjabi, front view".' },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 160, height: 200, position: 'centre' },
      { name: 'card', width: 600, height: 750, position: 'centre' },
      { name: 'large', width: 1200, height: 1500, position: 'centre' },
      { name: 'wide', width: 1920, withoutEnlargement: true },
    ],
    adminThumbnail: 'thumb',
  },
}
