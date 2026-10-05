import type { Field, FieldHook } from 'payload'

export const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const fillFrom =
  (source: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return toSlug(value)
    const from = data?.[source] ?? originalDoc?.[source]
    return typeof from === 'string' ? toSlug(from) : value
  }

/** URL slug that fills itself from another field (usually the name) when left empty. */
export const slugField = (source = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  label: 'URL slug',
  admin: {
    position: 'sidebar',
    description: 'Part of the web address. Filled in from the name if left empty. Changing it later sets up a redirect automatically.',
  },
  hooks: { beforeValidate: [fillFrom(source)] },
})
