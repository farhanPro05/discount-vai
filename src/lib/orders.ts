import { randomBytes } from 'crypto'

import type { Order, Product } from '../payload-types'
import { normalisePhone, isBdPhone } from './customer'
import { getClient } from './payload'
import { getCommerceInfo } from './settings'
import { startPayment } from './sslcommerz'
import { releaseOrder, releaseStock, reserveStock } from './stock'

export type CheckoutLine = { productId: number; colour: string; size: string; qty: number }

export type PricedItem = {
  productId: number
  name: string
  slug: string
  colour: string
  size: string
  qty: number
  unitPrice: number
  originalPrice: number
  lineTotal: number
}

/** Re-price the cart from the database (never trust prices sent by the browser). */
export async function priceCart(lines: CheckoutLine[]): Promise<{ items: PricedItem[]; subtotal: number; problems: string[] }> {
  const payload = await getClient()
  const ids = [...new Set(lines.map((l) => Number(l.productId)).filter(Boolean))]
  const res = ids.length
    ? await payload.find({
        collection: 'products',
        where: { and: [{ _status: { equals: 'published' } }, { id: { in: ids } }] },
        depth: 0,
        limit: ids.length,
        pagination: false,
      })
    : { docs: [] as Product[] }
  const byId = new Map(res.docs.map((p) => [p.id, p]))
  const items: PricedItem[] = []
  const problems: string[] = []
  for (const l of lines) {
    const p = byId.get(Number(l.productId))
    if (!p) {
      problems.push('An item in your cart is no longer available and was removed.')
      continue
    }
    const colour = p.colours?.find((c) => c.name === l.colour)
    const size = colour?.sizes?.find((s) => s.size === l.size)
    const stock = size?.stock ?? 0
    if (!colour || !size || stock <= 0) {
      problems.push(`${p.name} (${l.colour}, ${l.size}) just sold out.`)
      continue
    }
    let qty = Math.max(1, Math.min(9, Math.floor(Number(l.qty) || 1)))
    if (qty > stock) {
      problems.push(`Only ${stock} left of ${p.name} in ${l.size}; we changed the quantity.`)
      qty = stock
    }
    const unit = p.onSale && p.salePrice ? p.salePrice : p.price
    items.push({
      productId: p.id,
      name: p.name,
      slug: p.slug ?? '',
      colour: colour.name,
      size: size.size,
      qty,
      unitPrice: unit,
      originalPrice: p.price,
      lineTotal: unit * qty,
    })
  }
  return { items, subtotal: items.reduce((n, i) => n + i.lineTotal, 0), problems }
}

/** Check a discount code against a subtotal. */
export async function checkCode(raw: string, subtotal: number): Promise<{ ok: true; code: string; discount: number; label: string } | { ok: false; message: string }> {
  const code = raw.trim().toUpperCase()
  if (!code) return { ok: false, message: 'Enter a code first.' }
  const payload = await getClient()
  const res = await payload.find({ collection: 'discount-codes', where: { code: { equals: code } }, limit: 1, depth: 0 })
  const d = res.docs[0]
  const bad = { ok: false as const, message: "That code didn't work. Check the spelling and try again." }
  if (!d || !d.active) return bad
  if (d.expiresAt && new Date(d.expiresAt) < new Date()) return { ok: false, message: 'That code has expired.' }
  if (d.usageLimit && (d.used ?? 0) >= d.usageLimit) return { ok: false, message: 'That code has been fully used.' }
  if (d.minOrder && subtotal < d.minOrder) return { ok: false, message: `That code needs an order of ৳${d.minOrder.toLocaleString('en-US')} or more.` }
  const discount = Math.min(subtotal, d.type === 'percent' ? Math.round((subtotal * d.value) / 100) : d.value)
  return { ok: true, code, discount, label: d.type === 'percent' ? `${d.value}% off` : `৳${d.value} off` }
}

async function nextOrderNumber(): Promise<string> {
  const payload = await getClient()
  const last = await payload.find({ collection: 'orders', sort: '-createdAt', limit: 1, depth: 0, select: { orderNumber: true } })
  const n = Number((last.docs[0]?.orderNumber ?? 'DV-24817').replace(/\D/g, '')) || 24817
  for (let i = 1; i < 50; i++) {
    const candidate = `DV-${n + i}`
    const exists = await payload.find({ collection: 'orders', where: { orderNumber: { equals: candidate } }, limit: 1, depth: 0 })
    if (!exists.docs.length) return candidate
  }
  return `DV-${Date.now().toString().slice(-7)}`
}

export type CheckoutInput = {
  lines: CheckoutLine[]
  name: string
  phone: string
  email?: string
  district: string
  area: string
  address: string
  zone: 'inside' | 'outside'
  notes?: string
  code?: string
  payment: 'cod' | 'online'
  subscribe?: boolean
}

export type CheckoutResult =
  | { ok: true; redirect: string }
  | { ok: false; message?: string; errors?: Partial<Record<keyof CheckoutInput, string>>; problems?: string[] }

/** Create the order. Cash on Delivery orders are confirmed straight away; online orders go to SSLCommerz. */
export async function placeOrder(input: CheckoutInput, customerId?: number | null): Promise<CheckoutResult> {
  const errors: Partial<Record<keyof CheckoutInput, string>> = {}
  if (!input.name?.trim()) errors.name = 'Please enter your full name.'
  if (!isBdPhone(input.phone ?? '')) errors.phone = 'Enter a Bangladeshi mobile number, e.g. 01712 345678.'
  if (input.email && !/^\S+@\S+\.\S{2,}$/.test(input.email.trim())) errors.email = "That email doesn't look right."
  if (!input.district?.trim()) errors.district = 'Choose your district or city.'
  if (!input.area?.trim()) errors.area = 'Enter your area.'
  if (!input.address?.trim() || input.address.trim().length < 6) errors.address = 'Add your house, road and a landmark.'
  if (input.zone !== 'inside' && input.zone !== 'outside') errors.zone = 'Choose a delivery zone.'
  if (Object.keys(errors).length) return { ok: false, errors, message: 'Please check the highlighted fields.' }

  const commerce = await getCommerceInfo()
  if (input.payment === 'cod' && (!commerce.codEnabled || !commerce.codZones.includes(input.zone)))
    return { ok: false, message: 'Cash on Delivery is not available for this address. Please pay online.' }
  if (input.payment === 'online' && !commerce.onlineEnabled) return { ok: false, message: 'Online payment is coming soon. Please choose Cash on Delivery.' }

  const { items, subtotal, problems } = await priceCart(input.lines ?? [])
  if (!items.length) return { ok: false, message: 'Your cart is empty.', problems }
  if (problems.length) return { ok: false, message: 'Your cart changed. Please review it and place the order again.', problems }

  let discount = 0
  let code: string | null = null
  if (input.code?.trim()) {
    const c = await checkCode(input.code, subtotal)
    if (!c.ok) return { ok: false, errors: { code: c.message }, message: c.message }
    discount = c.discount
    code = c.code
  }
  const fee = input.zone === 'inside' ? commerce.inside.fee : commerce.outside.fee
  const delivery = commerce.freeOver && subtotal >= commerce.freeOver ? 0 : fee
  const total = Math.max(0, subtotal - discount + delivery)

  const payload = await getClient()
  // Take the stock now, in the same step as the final check, so two shoppers can't both buy the last one.
  // Online orders hold it while the customer pays; it's given back if the payment fails or is abandoned.
  const held = await reserveStock(payload, items)
  if (!held.ok) return { ok: false, message: 'Some items sold out while you were checking out. Please review your cart.', problems: held.problems }

  const orderNumber = await nextOrderNumber()
  const accessToken = randomBytes(16).toString('hex')
  const needsGateway = input.payment === 'online' || (input.payment === 'cod' && commerce.codAdvance && delivery > 0)
  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      orderNumber,
      accessToken,
      status: 'pending',
      paymentMethod: input.payment,
      paymentStatus: needsGateway ? 'pending' : 'unpaid_cod',
      customer: customerId ?? null,
      contact: { name: input.name.trim(), phone: normalisePhone(input.phone), email: input.email?.trim() || null },
      address: { district: input.district.trim(), area: input.area.trim(), line: input.address.trim() },
      zone: input.zone,
      items: items.map((i) => ({
        product: i.productId,
        name: i.name,
        colour: i.colour,
        size: i.size,
        qty: i.qty,
        unitPrice: i.unitPrice,
        originalPrice: i.originalPrice,
        lineTotal: i.lineTotal,
      })),
      subtotal,
      delivery,
      discount,
      discountCode: code,
      total,
      notes: input.notes?.trim() || null,
      stockCommitted: true,
    },
  }).catch(async (err) => {
    await releaseStock(payload, items)
    throw err
  })

  if (input.subscribe && input.email?.trim()) {
    await payload
      .create({ collection: 'subscribers', data: { email: input.email.trim().toLowerCase(), source: 'checkout' }, overrideAccess: true })
      .catch(() => null)
  }

  const confirmUrl = `/order/${orderNumber}?t=${accessToken}`
  if (!needsGateway) return { ok: true, redirect: confirmUrl }
  const amount = input.payment === 'online' ? total : delivery
  const pay = await beginPayment(order, amount)
  return pay.ok ? { ok: true, redirect: pay.url } : { ok: true, redirect: `/order/${orderNumber}/payment-failed?t=${accessToken}` }
}

/** Open (or re-open) an SSLCommerz session for an order. */
export async function beginPayment(order: Order, amount: number): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const payload = await getClient()
  const tranId = `${order.orderNumber}-${randomBytes(3).toString('hex')}`
  await payload.update({
    collection: 'orders',
    id: order.id,
    overrideAccess: true,
    data: { paymentStatus: 'pending', payment: { ...(order.payment ?? {}), tranId, message: null } },
  })
  const res = await startPayment(order, amount, tranId)
  if ('url' in res) return { ok: true, url: res.url }
  // The gateway didn't open: give the stock back until the customer retries or switches to COD.
  await releaseOrder(payload, order.id, { paymentStatus: 'failed', payment: { ...(order.payment ?? {}), tranId, message: res.error } })
  return { ok: false, message: res.error }
}

/** Load an order for its public pages: the access token from the link, or the signed-in owner. */
export async function getOrderForViewer(orderNumber: string, token?: string | null, customerId?: number | null): Promise<Order | null> {
  const payload = await getClient()
  const res = await payload.find({ collection: 'orders', where: { orderNumber: { equals: orderNumber } }, limit: 1, depth: 2 })
  const order = res.docs[0]
  if (!order) return null
  const ownerId = typeof order.customer === 'object' ? order.customer?.id : order.customer
  if ((token && token === order.accessToken) || (customerId && ownerId === customerId)) return order
  return null
}
