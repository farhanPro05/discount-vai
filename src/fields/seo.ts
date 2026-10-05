import type { Field } from 'payload'

/** Optional overrides for Google and social sharing. Empty fields fall back to automatic text. */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'Search & sharing (optional)',
  admin: {
    description: 'Leave empty to use the automatic title and description. Fill in to override what Google and Facebook show.',
  },
  fields: [
    { name: 'title', type: 'text', label: 'Page title', maxLength: 70 },
    { name: 'description', type: 'textarea', label: 'Meta description', maxLength: 170 },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Share image' },
    { name: 'preview', type: 'ui', admin: { components: { Field: '/admin/SeoPreview#SeoPreview' } } },
  ],
}
