'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { buildWhere, getNav, listProducts, suggest, toCard, type ListFilters, type SortKey } from '../../lib/catalog'
import { CUSTOMER_COOKIE, getCustomer, isBdPhone, normalisePhone } from '../../lib/customer'
import { safePath } from '../../lib/format'
import { TOO_MANY, tooMany } from '../../lib/rateLimit'
import {
  beginPayment,
  checkCode,
  getOrderForViewer,
  placeOrder,
  priceCart,
  type CheckoutInput,
  type CheckoutLine,
} from '../../lib/orders'
import { getClient } from '../../lib/payload'
import { getCommerceInfo } from '../../lib/settings'
import type { CardProduct } from '../../lib/types'
import { holdOrder } from '../../lib/stock'

type SubscriberSource = 'popup' | 'footer' | 'home-teaser' | 'coming-soon' | 'checkout' | 'account'
const SOURCES: SubscriberSource[] = ['popup', 'footer', 'home-teaser', 'coming-soon', 'checkout', 'account']

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Join the Vai List (pop-up, footer, Coming Soon pages, homepage teaser). */
export async function subscribeAction(
  email: string,
  source: SubscriberSource,
  interest?: string,
): Promise<{ ok: boolean; message?: string }> {
  const clean = String(email ?? '').trim().toLowerCase().slice(0, 200)
  if (!EMAIL.test(clean)) return { ok: false, message: "That email doesn't look right. Try name@example.com" }
  if (await tooMany('subscribe')) return { ok: false, message: TOO_MANY }
  if (!SOURCES.includes(source)) source = 'popup'
  interest = typeof interest === 'string' ? interest.slice(0, 60) : undefined
  const payload = await getClient()
  const existing = await payload.find({ collection: 'subscribers', where: { email: { equals: clean } }, limit: 1, depth: 0 })
  if (existing.docs[0]) {
    if (interest && existing.docs[0].interest !== interest) {
      await payload.update({ collection: 'subscribers', id: existing.docs[0].id, data: { interest }, overrideAccess: true })
    }
    return { ok: true }
  }
  await payload.create({ collection: 'subscribers', data: { email: clean, source, interest: interest ?? null }, overrideAccess: true })
  return { ok: true }
}

export async function suggestAction(q: string) {
  return suggest(String(q ?? '').slice(0, 80))
}

/** What the search box shows before anything is typed: best sellers and popular words. */
export async function searchDefaultsAction() {
  const [{ cards }, nav] = await Promise.all([listProducts({}, 'best', 1, 4), getNav()])
  const popular = nav
    .flatMap((t) => t.children.filter((c) => !c.soon).map((c) => c.label.replace(/\s*\(.*\)/, '').toLowerCase()))
    .slice(0, 6)
  return { picks: cards, popular }
}

/** Current cards (price, stock) for products remembered in the browser, in the same order; removed ones are dropped. */
export async function freshCardsAction(slugs: string[]): Promise<CardProduct[]> {
  const list = (Array.isArray(slugs) ? slugs : []).filter((s): s is string => typeof s === 'string' && s.length < 200).slice(0, 12)
  if (!list.length) return []
  const payload = await getClient()
  const res = await payload.find({
    collection: 'products',
    where: { and: [{ _status: { equals: 'published' } }, { slug: { in: list } }] },
    depth: 1,
    limit: list.length,
    pagination: false,
  })
  const bySlug = new Map(res.docs.map((p) => [p.slug, toCard(p)]))
  return list.map((s) => bySlug.get(s)).filter((c): c is CardProduct => !!c)
}

export async function loadMoreAction(filters: ListFilters, sort: SortKey, page: number) {
  return listProducts(filters, sort, Math.max(1, Math.floor(page)))
}

/** Live "Show N results" count while choosing filters. */
export async function countAction(filters: ListFilters): Promise<number> {
  const payload = await getClient()
  const res = await payload.count({ collection: 'products', where: buildWhere(filters) })
  return res.totalDocs
}

/** Re-check the cart against current prices and stock. */
export async function priceCartAction(lines: CheckoutLine[]) {
  return priceCart(Array.isArray(lines) ? lines.slice(0, 50) : [])
}

export async function checkCodeAction(code: string, lines: CheckoutLine[]) {
  if (await tooMany('code')) return { ok: false as const, message: TOO_MANY }
  const { subtotal } = await priceCart(Array.isArray(lines) ? lines.slice(0, 50) : [])
  return checkCode(String(code ?? '').slice(0, 40), subtotal)
}

export async function placeOrderAction(input: CheckoutInput) {
  // Orders hold stock, so a flood of fake orders could empty the shop: cap orders per visitor.
  if (await tooMany('order')) return { ok: false as const, message: TOO_MANY }
  const customer = await getCustomer()
  return placeOrder(input, customer?.id ?? null)
}

const CLOSED = ['cancelled', 'returned']
const paidUp = (o: { paymentStatus: string; paymentMethod: string; advancePaid?: number | null }) =>
  o.paymentStatus === 'paid' || (o.paymentMethod === 'cod' && (o.advancePaid ?? 0) > 0)

/** "Retry payment" on the payment-failed page. */
export async function retryPaymentAction(orderNumber: string, token: string): Promise<{ ok: false; message: string } | never> {
  if (await tooMany('payment')) return { ok: false, message: TOO_MANY }
  const order = await getOrderForViewer(orderNumber, token)
  if (!order) return { ok: false, message: 'We could not find that order.' }
  if (paidUp(order)) redirect(`/order/${order.orderNumber}?t=${encodeURIComponent(token)}`)
  if (CLOSED.includes(order.status)) return { ok: false, message: 'This order was cancelled. Please place a new order.' }
  const commerce = await getCommerceInfo()
  if (!commerce.onlineEnabled) return { ok: false, message: 'Online payment is not available right now. Please switch to Cash on Delivery.' }
  // Its items may have been released while the payment was pending: take them again first.
  const payload = await getClient()
  const held = await holdOrder(payload, order.id)
  if (!held.ok) return { ok: false, message: `Sorry, part of this order sold out in the meantime. ${held.problems.join(' ')}` }
  const amount = order.paymentMethod === 'online' ? order.total : order.delivery
  const res = await beginPayment({ ...order, stockCommitted: true }, amount)
  if (!res.ok) return { ok: false, message: res.message }
  redirect(res.url)
}

/** "Switch to Cash on Delivery" on the payment-failed page. */
export async function switchToCodAction(orderNumber: string, token: string): Promise<{ ok: false; message: string } | never> {
  if (await tooMany('payment')) return { ok: false, message: TOO_MANY }
  const order = await getOrderForViewer(orderNumber, token)
  if (!order) return { ok: false, message: 'We could not find that order.' }
  if (paidUp(order)) redirect(`/order/${order.orderNumber}?t=${encodeURIComponent(token)}`)
  if (CLOSED.includes(order.status)) return { ok: false, message: 'This order was cancelled. Please place a new order.' }
  const commerce = await getCommerceInfo()
  if (!commerce.codEnabled || !commerce.codZones.includes(order.zone))
    return { ok: false, message: 'Cash on Delivery is not available for this address.' }
  if (commerce.codAdvance && order.delivery > 0)
    return { ok: false, message: 'Cash on Delivery needs the delivery charge paid online first. Please retry the payment.' }
  // Take the items again (they may have been released) and confirm the order as COD in one step.
  const payload = await getClient()
  const held = await holdOrder(payload, order.id, { paymentMethod: 'cod', paymentStatus: 'unpaid_cod' })
  if (!held.ok) return { ok: false, message: `Sorry, part of this order sold out in the meantime. ${held.problems.join(' ')}` }
  redirect(`/order/${order.orderNumber}?t=${encodeURIComponent(token)}`)
}

/** Contact page form. */
export async function sendMessageAction(data: {
  name: string
  phone: string
  email?: string
  orderNumber?: string
  topic: string
  message: string
}): Promise<{ ok: boolean; errors?: Record<string, string> }> {
  // Server actions can be called with anything: keep only text fields.
  const text = (v: unknown) => (typeof v === 'string' ? v : '')
  data = { name: text(data?.name), phone: text(data?.phone), email: text(data?.email), orderNumber: text(data?.orderNumber), topic: text(data?.topic), message: text(data?.message) }
  const errors: Record<string, string> = {}
  if (!data.name?.trim()) errors.name = 'Please tell us your name.'
  if (!isBdPhone(data.phone ?? '') && !EMAIL.test(data.email ?? '')) errors.phone = 'Add a phone number (or an email) so we can reply.'
  if (data.email && !EMAIL.test(data.email.trim())) errors.email = "That email doesn't look right."
  if (!data.message?.trim() || data.message.trim().length < 5) errors.message = "Tell us what's up."
  if (Object.keys(errors).length) return { ok: false, errors }
  if (await tooMany('message')) return { ok: false, errors: { message: TOO_MANY } }
  const payload = await getClient()
  await payload.create({
    collection: 'messages',
    overrideAccess: true,
    data: {
      name: data.name.trim().slice(0, 120),
      phone: data.phone ? normalisePhone(data.phone) : null,
      email: data.email?.trim() || null,
      orderNumber: data.orderNumber?.trim().slice(0, 30) || null,
      topic: data.topic?.slice(0, 60) || null,
      message: data.message.trim().slice(0, 4000),
    },
  })
  return { ok: true }
}

/* ---------- Customer accounts ---------- */

type AuthState = { error?: string; fields?: Record<string, string> } | undefined

async function setCustomerCookie(token: string, remember: boolean) {
  ;(await cookies()).set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  })
}

export async function loginAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const id = String(form.get('identifier') ?? '').trim()
  const password = String(form.get('password') ?? '')
  const remember = form.get('remember') === 'on'
  const next = safePath(form.get('next'), '/account/orders')
  if (!id || !password) return { error: 'Enter your phone or email and your password.', fields: { identifier: id } }
  if (await tooMany('login')) return { error: TOO_MANY, fields: { identifier: id } }
  const payload = await getClient()
  try {
    const data = id.includes('@') ? { email: id.toLowerCase(), password } : { username: normalisePhone(id), password }
    const res = await payload.login({ collection: 'customers', data })
    if (!res.token) throw new Error('no token')
    await setCustomerCookie(res.token, remember)
  } catch {
    return { error: "That phone/email and password don't match. Try again or reset your password.", fields: { identifier: id } }
  }
  redirect(next)
}

export async function registerAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const name = String(form.get('name') ?? '').trim().slice(0, 120)
  const id = String(form.get('identifier') ?? '').trim().slice(0, 200)
  const password = String(form.get('password') ?? '')
  const news = form.get('news') === 'on'
  const fields = { name, identifier: id }
  if (!name) return { error: 'Please enter your full name.', fields }
  const isEmail = id.includes('@')
  if (isEmail ? !EMAIL.test(id) : !isBdPhone(id)) return { error: 'Enter a Bangladeshi mobile number (01XXXXXXXXX) or an email.', fields }
  if (password.length < 8) return { error: 'Use 8 or more characters for your password.', fields }
  if (await tooMany('register')) return { error: TOO_MANY, fields }
  const payload = await getClient()
  const username = isEmail ? id.toLowerCase() : normalisePhone(id)
  const taken = await payload.find({
    collection: 'customers',
    where: { or: [{ username: { equals: username } }, ...(isEmail ? [{ email: { equals: id.toLowerCase() } }] : [])] },
    limit: 1,
    depth: 0,
  })
  if (taken.docs[0]) return { error: 'There is already an account with that phone or email. Try logging in.', fields }
  try {
    await payload.create({
      collection: 'customers',
      overrideAccess: true,
      data: { name, username, email: isEmail ? id.toLowerCase() : undefined, password },
    })
    const res = await payload.login({ collection: 'customers', data: { username, password } })
    if (res.token) await setCustomerCookie(res.token, true)
    if (news && isEmail) await subscribeAction(id, 'account')
  } catch {
    return { error: 'Something went wrong creating your account. Please try again.', fields }
  }
  redirect('/account/orders')
}

export async function logoutAction() {
  ;(await cookies()).delete(CUSTOMER_COOKIE)
  redirect('/account')
}

export type ForgotState = { error?: string; sent?: boolean; email?: string } | undefined

/** Email a password-reset link. Always answers the same way, so it never reveals who has an account. */
export async function forgotPasswordAction(_prev: ForgotState, form: FormData): Promise<ForgotState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 200)
  if (!EMAIL.test(email)) return { error: "That email doesn't look right. Try name@example.com", email }
  if (await tooMany('reset')) return { error: TOO_MANY, email }
  const payload = await getClient()
  try {
    await payload.forgotPassword({ collection: 'customers', data: { email } })
  } catch (err) {
    payload.logger.error({ err }, 'Password reset email failed')
  }
  return { sent: true, email }
}

/** Set a new password from the emailed link, then log the shopper in. */
export async function resetPasswordAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const token = String(form.get('token') ?? '')
  const password = String(form.get('password') ?? '')
  if (password.length < 8) return { error: 'Use 8 or more characters for your password.' }
  if (password !== String(form.get('confirm') ?? '')) return { error: "The two passwords don't match." }
  const payload = await getClient()
  try {
    const res = await payload.resetPassword({ collection: 'customers', data: { token, password }, overrideAccess: true })
    if (res.token) await setCustomerCookie(res.token, true)
  } catch {
    return { error: 'expired' }
  }
  redirect('/account/orders')
}

/** Track Order: find an order by its number and the phone used to place it. */
export async function trackOrderAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const raw = String(form.get('order') ?? '').trim().toUpperCase().replace(/^#/, '')
  const number = raw.startsWith('DV-') ? raw : `DV-${raw.replace(/\D/g, '')}`
  const phone = normalisePhone(String(form.get('phone') ?? ''))
  const fields = { order: raw, phone: String(form.get('phone') ?? '') }
  if (!raw || !phone) return { error: 'Enter your order number and phone number.', fields }
  if (await tooMany('track')) return { error: TOO_MANY, fields }
  const payload = await getClient()
  const res = await payload.find({ collection: 'orders', where: { orderNumber: { equals: number } }, limit: 1, depth: 0 })
  const order = res.docs[0]
  if (!order || normalisePhone(order.contact.phone) !== phone)
    return { error: "We couldn't find an order with that number and phone. Check both and try again.", fields }
  redirect(`/order/${order.orderNumber}?t=${order.accessToken}`)
}

/* ---------- Account: profile and addresses ---------- */

export async function updateProfileAction(_prev: AuthState, form: FormData): Promise<AuthState & { ok?: boolean }> {
  const customer = await getCustomer()
  if (!customer) redirect('/account')
  const name = String(form.get('name') ?? '').trim().slice(0, 120)
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  if (!name) return { error: 'Please enter your name.' }
  if (email && !EMAIL.test(email)) return { error: "That email doesn't look right." }
  const payload = await getClient()
  try {
    await payload.update({ collection: 'customers', id: customer.id, overrideAccess: true, data: { name, email: email || undefined } })
  } catch {
    return { error: 'That email is already used by another account.' }
  }
  revalidatePath('/account', 'layout')
  return { ok: true }
}

export async function saveAddressAction(_prev: AuthState, form: FormData): Promise<AuthState & { ok?: boolean }> {
  const customer = await getCustomer()
  if (!customer) redirect('/account')
  const address = {
    label: String(form.get('label') ?? '').trim().slice(0, 40) || 'Home',
    district: String(form.get('district') ?? '').trim(),
    area: String(form.get('area') ?? '').trim().slice(0, 80),
    line: String(form.get('line') ?? '').trim().slice(0, 300),
  }
  if (!address.district || !address.area || address.line.length < 6) return { error: 'Fill in the district, area and full address.' }
  const payload = await getClient()
  const existing = (customer.addresses ?? []).map(({ label, district, area, line }) => ({ label, district, area, line }))
  await payload.update({ collection: 'customers', id: customer.id, overrideAccess: true, data: { addresses: [address, ...existing].slice(0, 5) } })
  revalidatePath('/account/addresses')
  return { ok: true }
}

export async function deleteAddressAction(index: number) {
  const customer = await getCustomer()
  if (!customer) redirect('/account')
  const payload = await getClient()
  const next = (customer.addresses ?? []).filter((_, i) => i !== index).map(({ label, district, area, line }) => ({ label, district, area, line }))
  await payload.update({ collection: 'customers', id: customer.id, overrideAccess: true, data: { addresses: next } })
  revalidatePath('/account/addresses')
}
