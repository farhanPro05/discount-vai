import { Forbidden, type CollectionBeforeOperationHook, type CollectionConfig } from 'payload'

import { isOwner, isStaff } from '../access'
import { passwordResetEmail } from '../lib/emails'

/**
 * Shoppers sign up, log in and reset passwords through the website's own forms, which are checked and
 * rate-limited. The same actions on Payload's REST API (/api/customers, /login, /forgot-password…)
 * would skip all that, so only staff may use them there.
 */
const SITE_FORMS_ONLY = ['create', 'login', 'forgotPassword', 'resetPassword']
const onlyThroughSiteForms: CollectionBeforeOperationHook = ({ operation, req }) => {
  if (req.payloadAPI !== 'local' && !isStaff(req) && SITE_FORMS_ONLY.includes(operation)) throw new Forbidden(req.t)
}

/** Shoppers' accounts. They log in on the website (phone or email), never in the admin panel. */
export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Customer', plural: 'Customers' },
  admin: {
    group: 'Shop',
    useAsTitle: 'name',
    defaultColumns: ['name', 'username', 'email', 'createdAt'],
  },
  auth: {
    loginWithUsername: { allowEmailLogin: true, requireEmail: false, requireUsername: true },
    tokenExpiration: 60 * 60 * 24 * 30,
    cookies: { sameSite: 'Lax' },
    useAPIKey: false,
    forgotPassword: {
      expiration: 60 * 60 * 1000,
      generateEmailSubject: () => passwordResetEmail('').subject,
      generateEmailHTML: (args) => passwordResetEmail(args?.token ?? '', (args?.user as { name?: string } | undefined)?.name).html,
    },
  },
  access: {
    admin: () => false,
    read: ({ req }) => (isStaff(req) ? true : req.user?.collection === 'customers' ? { id: { equals: req.user.id } } : false),
    create: ({ req }) => isStaff(req),
    update: ({ req }) => (isStaff(req) ? true : req.user?.collection === 'customers' ? { id: { equals: req.user.id } } : false),
    delete: ({ req }) => isOwner(req),
  },
  hooks: { beforeOperation: [onlyThroughSiteForms] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'addresses',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', admin: { placeholder: 'Home' } },
        { name: 'district', type: 'text' },
        { name: 'area', type: 'text' },
        { name: 'line', type: 'textarea' },
      ],
    },
  ],
}
