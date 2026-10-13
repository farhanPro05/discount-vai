import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionConfig,
} from 'payload'

import { isOwner, isStaff } from '../access'
import { newOrderAlertEmail, orderConfirmationEmail } from '../lib/emails'
import { isPlaceholder } from '../lib/format'
import { orderLines, releaseStock, reserveStock } from '../lib/stock'
import type { Order } from '../payload-types'

export const ORDER_STATUSES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Returned', value: 'returned' },
] as const

export const PAYMENT_STATUSES = [
  { label: 'Unpaid – COD', value: 'unpaid_cod' },
  { label: 'Awaiting online payment', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Payment failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
] as const

/** Record every status change in the order's timeline. */
const trackStatus: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  const prev = originalDoc?.status
  if (operation === 'create' || (data.status && data.status !== prev)) {
    const timeline = Array.isArray(data.timeline) ? data.timeline : (originalDoc?.timeline ?? [])
    data.timeline = [...timeline, { status: data.status ?? 'pending', at: new Date().toISOString() }]
  }
  return data
}

const BACK = ['cancelled', 'returned']

/**
 * Keep the order's stock in step with its status. Cancelling or returning gives the stock back;
 * re-opening a cancelled order takes it again (or refuses if it has sold out since).
 * `stockCommitted` is only ever changed here or by lib/stock.ts (context.stockFlag), never by a
 * stale value from an open admin form.
 *
 * This must run before the order is written: once the order's save has written its item links,
 * its open transaction locks the products, and a product update from here would wait on it forever.
 */
const stockOnStatus: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req, context }) => {
  if (operation !== 'update' || !originalDoc) return data
  // Saves made by lib/stock.ts already hold the stock lock and set the flag themselves.
  if (context?.stockFlag) return data
  data.stockCommitted = originalDoc.stockCommitted
  if (!data.status || data.status === originalDoc.status) return data
  const wasBack = BACK.includes(originalDoc.status)
  const nowBack = BACK.includes(data.status)
  if (!wasBack && nowBack && originalDoc.stockCommitted) {
    await releaseStock(req.payload, orderLines(originalDoc.items ?? []))
    data.stockCommitted = false
  } else if (wasBack && !nowBack && !originalDoc.stockCommitted) {
    const res = await reserveStock(req.payload, orderLines(originalDoc.items ?? []))
    if (!res.ok) throw new APIError(`Not enough stock to re-open this order. ${res.problems.join(' ')}`, 400, null, true)
    data.stockCommitted = true
  }
  return data
}

/** Deleting an order that still holds stock gives it back first. */
const stockOnDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const order = await req.payload.findByID({ collection: 'orders', id, depth: 0, overrideAccess: true, req }).catch(() => null)
  if (order?.stockCommitted) await releaseStock(req.payload, orderLines(order.items ?? []))
}

/** COD placed, or an online / advance payment confirmed. */
const isConfirmed = (s?: string | null) => s === 'unpaid_cod' || s === 'paid'

/**
 * When an order is confirmed: count the discount code's use and email the customer and the shop.
 * A failed email never blocks the order; it's logged instead.
 */
const onConfirmed: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation, context }) => {
  if (context?.seed) return doc
  if (!isConfirmed(doc.paymentStatus) || (operation === 'update' && isConfirmed(previousDoc?.paymentStatus))) return doc
  const order = doc as Order
  if (order.discountCode) {
    const res = await req.payload.find({ collection: 'discount-codes', where: { code: { equals: order.discountCode } }, limit: 1, depth: 0, req })
    const code = res.docs[0]
    if (code) await req.payload.update({ collection: 'discount-codes', id: code.id, data: { used: (code.used ?? 0) + 1 }, overrideAccess: true, req })
  }
  try {
    const [commerce, site] = await Promise.all([
      req.payload.findGlobal({ slug: 'commerce', depth: 0, req }),
      req.payload.findGlobal({ slug: 'site', depth: 0, req }),
    ])
    const sends: Promise<unknown>[] = []
    if (commerce.customerEmails !== false && order.contact.email) {
      const mail = orderConfirmationEmail(order, isPlaceholder(site.phone) ? null : site.phone)
      sends.push(req.payload.sendEmail({ to: order.contact.email, ...(site.email && !isPlaceholder(site.email) ? { replyTo: site.email } : {}), ...mail }))
    }
    const shop = commerce.orderAlertEmail || (isPlaceholder(site.email) ? null : site.email)
    if (shop) sends.push(req.payload.sendEmail({ to: shop, ...newOrderAlertEmail(order) }))
    const results = await Promise.allSettled(sends)
    for (const r of results) if (r.status === 'rejected') req.payload.logger.error({ err: r.reason }, `Order email for ${order.orderNumber} failed`)
  } catch (err) {
    req.payload.logger.error({ err }, `Order emails for ${order.orderNumber} failed`)
  }
  return doc
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Order', plural: 'Orders' },
  defaultSort: '-createdAt',
  admin: {
    group: 'Shop',
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'contact.name', 'total', 'paymentMethod', 'paymentStatus', 'status', 'createdAt'],
    listSearchableFields: ['orderNumber', 'contact.phone', 'contact.name'],
    description: 'New orders arrive here as "Pending". Call the customer, then move the order to Confirmed → Shipped → Delivered.',
  },
  access: {
    read: ({ req }) => {
      if (isStaff(req)) return true
      if (req.user?.collection === 'customers') return { customer: { equals: req.user.id } }
      return false
    },
    create: ({ req }) => isStaff(req),
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isOwner(req),
  },
  hooks: { beforeChange: [trackStatus, stockOnStatus], afterChange: [onConfirmed], beforeDelete: [stockOnDelete] },
  fields: [
    { name: 'invoice', type: 'ui', admin: { position: 'sidebar', components: { Field: '/admin/PrintInvoice#PrintInvoice' } } },
    {
      type: 'row',
      fields: [
        { name: 'orderNumber', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true, width: '50%' } },
        { name: 'status', type: 'select', required: true, defaultValue: 'pending', options: [...ORDER_STATUSES], admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'paymentMethod',
          type: 'select',
          required: true,
          options: [
            { label: 'Cash on Delivery', value: 'cod' },
            { label: 'Online (SSLCommerz)', value: 'online' },
          ],
          admin: { width: '50%' },
        },
        { name: 'paymentStatus', type: 'select', required: true, defaultValue: 'unpaid_cod', options: [...PAYMENT_STATUSES], admin: { width: '50%' } },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '34%' } },
            { name: 'phone', type: 'text', required: true, admin: { width: '33%' } },
            { name: 'email', type: 'email', admin: { width: '33%' } },
          ],
        },
      ],
    },
    {
      name: 'address',
      type: 'group',
      label: 'Delivery address',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'district', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'area', type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
        { name: 'line', type: 'textarea', required: true, label: 'Full address' },
      ],
    },
    {
      name: 'zone',
      type: 'select',
      required: true,
      options: [
        { label: 'Inside Dhaka', value: 'inside' },
        { label: 'Outside Dhaka', value: 'outside' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      admin: { readOnly: true },
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'colour', type: 'text', admin: { width: '20%' } },
            { name: 'size', type: 'text', admin: { width: '20%' } },
            { name: 'qty', type: 'number', required: true, min: 1, admin: { width: '20%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'unitPrice', type: 'number', required: true, label: 'Unit price (৳)', admin: { width: '34%' } },
            { name: 'originalPrice', type: 'number', label: 'Original price (৳)', admin: { width: '33%' } },
            { name: 'lineTotal', type: 'number', required: true, label: 'Line total (৳)', admin: { width: '33%' } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', required: true, label: 'Subtotal (৳)', admin: { readOnly: true, width: '25%' } },
        { name: 'delivery', type: 'number', required: true, label: 'Delivery (৳)', admin: { readOnly: true, width: '25%' } },
        { name: 'discount', type: 'number', defaultValue: 0, label: 'Discount (৳)', admin: { readOnly: true, width: '25%' } },
        { name: 'total', type: 'number', required: true, label: 'Total (৳)', admin: { readOnly: true, width: '25%' } },
      ],
    },
    { name: 'discountCode', type: 'text', admin: { readOnly: true } },
    { name: 'advancePaid', type: 'number', label: 'Paid in advance (৳)', defaultValue: 0, admin: { readOnly: true } },
    { name: 'notes', type: 'textarea', label: "Customer's notes", admin: { readOnly: true } },
    {
      name: 'shipping',
      type: 'group',
      label: 'Courier and tracking',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'courier', type: 'text', admin: { width: '34%' } },
            { name: 'trackingId', type: 'text', label: 'Tracking ID', admin: { width: '33%' } },
            { name: 'expected', type: 'date', label: 'Expected delivery', admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
          ],
        },
      ],
    },
    { name: 'staffNotes', type: 'textarea', label: 'Staff notes (private)', access: { read: ({ req }) => isStaff(req) } },
    {
      name: 'timeline',
      type: 'array',
      admin: { readOnly: true, initCollapsed: true },
      fields: [
        { name: 'status', type: 'text' },
        { name: 'at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'note', type: 'text' },
      ],
    },
    {
      name: 'payment',
      type: 'group',
      label: 'Online payment details',
      // Online orders, and COD orders that paid the delivery charge in advance.
      admin: { condition: (data) => data?.paymentMethod === 'online' || !!data?.payment?.tranId },
      fields: [
        { name: 'tranId', type: 'text', label: 'Transaction ID', index: true, admin: { readOnly: true } },
        { name: 'valId', type: 'text', label: 'Validation ID', admin: { readOnly: true } },
        { name: 'bankTranId', type: 'text', label: 'Bank transaction ID', admin: { readOnly: true } },
        { name: 'cardType', type: 'text', label: 'Paid with', admin: { readOnly: true } },
        { name: 'message', type: 'text', label: 'Gateway message', admin: { readOnly: true } },
      ],
    },
    { name: 'customer', type: 'relationship', relationTo: 'customers', admin: { position: 'sidebar', readOnly: true } },
    // Set once the items have been taken out of stock (COD: when placed; online: when paid).
    {
      name: 'stockCommitted',
      type: 'checkbox',
      defaultValue: false,
      label: 'Holding stock',
      access: { read: ({ req }) => isStaff(req) },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Ticked while this order holds its items. Cancelling or returning the order gives them back automatically.',
      },
    },
    {
      name: 'stockProblem',
      type: 'textarea',
      label: 'Stock problem',
      access: { read: ({ req }) => isStaff(req) },
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => !!data?.stockProblem,
        description: 'The customer paid, but these items had sold out. Refund them or restock before shipping.',
      },
    },
    {
      name: 'accessToken',
      type: 'text',
      admin: { hidden: true },
      access: { read: ({ req }) => isStaff(req) },
    },
  ],
}
