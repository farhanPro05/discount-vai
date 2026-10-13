/*
 * npm run check:shop — checks the stock and order rules against the LOCAL database, then puts
 * everything back. It places, cancels and deletes test orders, so it refuses to run against a live
 * database (same rule as the seed).
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { releaseUnpaidOrders } from '../jobs/releaseUnpaidOrders'
import { placeOrder } from '../lib/orders'
import { holdOrder, releaseOrder, releaseStock, reserveStock } from '../lib/stock'
import type { Product } from '../payload-types'

const host = (() => {
  try {
    return new URL(process.env.DATABASE_URL || '').hostname
  } catch {
    return ''
  }
})()
if (process.env.NODE_ENV === 'production' || !['localhost', '127.0.0.1', '::1'].includes(host)) {
  console.error('Refusing to run: check:shop only runs against a local database.')
  process.exit(1)
}

const payload = await getPayload({ config })
const results: string[] = []
let failed = 0
const check = (name: string, ok: boolean, info = '') => {
  if (!ok) failed++
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? `  (${info})` : ''}`)
}

// A published product with a colour/size that has at least 6 in stock.
const { docs: products } = await payload.find({ collection: 'products', where: { _status: { equals: 'published' } }, limit: 100, depth: 0, overrideAccess: true })
let pick: { p: Product; colour: string; size: string } | null = null
for (const p of products) {
  for (const c of p.colours ?? []) {
    const s = (c.sizes ?? []).find((x) => (x.stock ?? 0) >= 6)
    if (s && !pick) pick = { p, colour: c.name, size: s.size }
  }
}
if (!pick) {
  console.error('No product with 6 or more in one size. Run npm run seed first.')
  process.exit(1)
}
const { p: snap, colour: COLOUR, size: SIZE } = pick
const ID = snap.id
const live = () => payload.findByID({ collection: 'products', id: ID, depth: 0, draft: false, overrideAccess: true })
const latest = () => payload.findByID({ collection: 'products', id: ID, depth: 0, draft: true, overrideAccess: true })
const stockOf = (p: Product) => p.colours?.find((c) => c.name === COLOUR)?.sizes?.find((s) => s.size === SIZE)?.stock ?? -1
const line = (qty: number) => ({ productId: ID, colour: COLOUR, size: SIZE, qty })
const checkout = (name: string, extra: Partial<Parameters<typeof placeOrder>[0]> = {}) =>
  placeOrder({ lines: [line(1)], name, phone: '01700000000', district: 'Dhaka', area: 'Dhanmondi', address: 'House 1, Road 2', zone: 'inside', payment: 'cod', ...extra })
const numberOf = (r: Awaited<ReturnType<typeof placeOrder>>) => (r.ok ? r.redirect.split('/')[2].split('?')[0] : '')
const start = stockOf(snap)
const code = (await payload.find({ collection: 'discount-codes', where: { active: { equals: true } }, limit: 1, overrideAccess: true })).docs[0]
const TEST = 'Shop Check'

try {
  // 1. Two checkouts for the same last units at the same moment.
  const all = start
  const [a, b] = await Promise.all([reserveStock(payload, [line(all)]), reserveStock(payload, [line(all)])])
  check('simultaneous checkouts for the last units: exactly one wins', [a.ok, b.ok].filter(Boolean).length === 1)
  check('stock is 0 after the winner', stockOf(await live()) === 0)
  await releaseStock(payload, [line(all)])
  check('releasing puts it back', stockOf(await live()) === start)

  // 2. A pending draft is neither published nor overwritten by stock changes.
  const kicker = snap.kicker
  await payload.update({ collection: 'products', id: ID, draft: true, data: { kicker: 'CHECK DRAFT' }, overrideAccess: true })
  await reserveStock(payload, [line(1)])
  const L = await live()
  const D = await latest()
  check('product stays published with a pending draft', L._status === 'published' && L.kicker === kicker)
  check('draft stays pending and gets the stock change', D._status === 'draft' && D.kicker === 'CHECK DRAFT' && stockOf(D) === start - 1)
  check('live stock went down', stockOf(L) === start - 1)
  await releaseStock(payload, [line(1)])

  // 3. A COD checkout (with a discount code if one exists).
  const used = code?.used ?? 0
  const res = await checkout(`${TEST} COD`, code ? { code: code.code } : {})
  const order = (await payload.find({ collection: 'orders', where: { orderNumber: { equals: numberOf(res) } }, overrideAccess: true })).docs[0]
  check('COD order placed and holds stock', !!order?.stockCommitted && order.paymentStatus === 'unpaid_cod', JSON.stringify(res).slice(0, 80))
  check('stock went down by one', stockOf(await live()) === start - 1)
  if (code) check('discount code use counted once', ((await payload.findByID({ collection: 'discount-codes', id: code.id, overrideAccess: true })).used ?? 0) === used + 1)

  // 4. Cancel twice, stale admin form, re-open, re-open when sold out.
  await payload.update({ collection: 'orders', id: order.id, data: { status: 'cancelled' }, overrideAccess: true })
  await payload.update({ collection: 'orders', id: order.id, data: { status: 'cancelled', staffNotes: 'again' }, overrideAccess: true })
  check('cancelling returns stock once', stockOf(await live()) === start)
  await payload.update({ collection: 'orders', id: order.id, data: { stockCommitted: true, staffNotes: 'stale form' } as never, overrideAccess: true })
  check('a stale "Holding stock" value is ignored', !(await payload.findByID({ collection: 'orders', id: order.id, overrideAccess: true })).stockCommitted)
  await payload.update({ collection: 'orders', id: order.id, data: { status: 'confirmed' }, overrideAccess: true })
  check('re-opening takes stock again', stockOf(await live()) === start - 1)
  await payload.update({ collection: 'orders', id: order.id, data: { status: 'cancelled' }, overrideAccess: true })
  await reserveStock(payload, [line(start)])
  let refused = ''
  try {
    await payload.update({ collection: 'orders', id: order.id, data: { status: 'confirmed' }, overrideAccess: true })
  } catch (e) {
    refused = (e as Error).message
  }
  check('re-opening is refused when sold out', refused.includes('Not enough stock'))
  await releaseStock(payload, [line(start)])

  // 5. Abandoned online payment: released by the job, taken again on retry, never released twice.
  await reserveStock(payload, [line(1)])
  const pending = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    context: { seed: true },
    data: {
      orderNumber: 'DV-CHECK-PENDING', accessToken: 'x', status: 'pending', paymentMethod: 'online', paymentStatus: 'pending', stockCommitted: true,
      contact: { name: TEST, phone: '01700000000' }, address: { district: 'Dhaka', area: 'Dhanmondi', line: 'Test' }, zone: 'inside',
      items: [{ product: ID, name: snap.name, colour: COLOUR, size: SIZE, qty: 1, unitPrice: 100, lineTotal: 100 }], subtotal: 100, delivery: 0, total: 100,
    } as never,
  })
  await payload.db.drizzle.execute(`update orders set updated_at = now() - interval '2 hours' where id = ${pending.id}` as never)
  await (releaseUnpaidOrders.handler as (args: unknown) => Promise<unknown>)({ req: { payload } })
  const after = await payload.findByID({ collection: 'orders', id: pending.id, overrideAccess: true })
  check('abandoned payment is released by the job', after.paymentStatus === 'failed' && !after.stockCommitted && stockOf(await live()) === start)
  check('a retry takes the stock again', (await holdOrder(payload, pending.id)).ok && stockOf(await live()) === start - 1)
  await releaseOrder(payload, pending.id)
  await releaseOrder(payload, pending.id)
  check('releasing twice returns stock once', stockOf(await live()) === start)

  // 6. Deleting: a delivered order keeps stock as is; a pending one gives it back.
  const del = await checkout(`${TEST} Delete`)
  const delOrder = (await payload.find({ collection: 'orders', where: { orderNumber: { equals: numberOf(del) } }, overrideAccess: true })).docs[0]
  await payload.update({ collection: 'orders', id: delOrder.id, data: { status: 'delivered' }, overrideAccess: true })
  await payload.delete({ collection: 'orders', id: delOrder.id, overrideAccess: true })
  check('deleting a delivered order leaves stock alone', stockOf(await live()) === start - 1)
  await releaseStock(payload, [line(1)])

  // 7. Inside-Dhaka delivery only for Dhaka; order numbers distinct and never reused.
  const zone = await checkout(`${TEST} Zone`, { district: 'Chattogram', area: 'Agrabad' })
  const zoneOrder = (await payload.find({ collection: 'orders', where: { orderNumber: { equals: numberOf(zone) } }, overrideAccess: true })).docs[0]
  check('a non-Dhaka address is charged outside-Dhaka delivery', zoneOrder?.zone === 'outside')
  const many = await Promise.all([checkout(`${TEST} N1`), checkout(`${TEST} N2`), checkout(`${TEST} N3`)])
  const numbers = many.map(numberOf)
  check('simultaneous orders get distinct numbers', numbers.every(Boolean) && new Set(numbers).size === 3, numbers.join(', '))
  const highest = numbers.sort().at(-1)!
  await payload.delete({ collection: 'orders', where: { orderNumber: { equals: highest } }, overrideAccess: true })
  const nextNumber = numberOf(await checkout(`${TEST} N4`))
  check('a deleted order number is not reused', !!nextNumber && nextNumber !== highest, `${highest} -> ${nextNumber}`)
} catch (err) {
  failed++
  results.push(`FAIL  the check stopped with an error: ${(err as Error).message}`)
} finally {
  // Put everything back: test orders, the product (live and no pending draft), the discount code.
  const mine = await payload.find({ collection: 'orders', where: { or: [{ 'contact.name': { like: TEST } }, { orderNumber: { like: 'DV-CHECK' } }] }, limit: 100, overrideAccess: true })
  for (const o of mine.docs) await payload.delete({ collection: 'orders', id: o.id, overrideAccess: true })
  const fields: Record<string, unknown> = {}
  for (const f of payload.collections.products.config.flattenedFields) {
    if ('name' in f && !['id', 'createdAt', 'updatedAt'].includes(f.name)) fields[f.name] = (snap as unknown as Record<string, unknown>)[f.name] ?? null
  }
  await payload.update({ collection: 'products', id: ID, draft: false, overrideAccess: true, context: { stockUpdate: true }, data: { ...fields, _status: 'published' } as never })
  if (code) await payload.update({ collection: 'discount-codes', id: code.id, data: { used: code.used }, overrideAccess: true })
  const back = await latest()
  results.push(`restored ${snap.name}: ${COLOUR} ${SIZE} stock ${stockOf(back)} (was ${start}), ${back._status}`)
  console.log(results.join('\n'))
  console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.')
  process.exit(failed ? 1 : 0)
}
