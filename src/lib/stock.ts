import type { Payload } from 'payload'

import type { Product } from '../payload-types'

/*
 * Every stock change goes through here.
 *
 * - Changes run one at a time (a lock shared by the whole server process), so "is there enough?"
 *   and "take it" can't interleave between two orders for the last item. This assumes one app
 *   instance (see the build plan, Deployment).
 * - A product can have an unpublished draft (edits saved but not live, or scheduled). Payload builds
 *   every update on top of the newest version, so a plain update would publish that draft. Instead
 *   the live product is re-saved from its live data, and the pending draft is re-saved from its own
 *   data, each with the stock change applied.
 */

export type StockLine = { productId: number; colour: string; size: string; qty: number; name?: string }
export type StockResult = { ok: true } | { ok: false; problems: string[] }

const LOCK = Symbol.for('discount-vai.stock-lock')
type LockHolder = { [LOCK]?: Promise<unknown> }

/** Run `fn` after every stock change already queued (shared across all routes in this process). */
export function withStockLock<T>(fn: () => Promise<T>): Promise<T> {
  const g = globalThis as LockHolder
  const run = (g[LOCK] ?? Promise.resolve()).then(fn, fn)
  g[LOCK] = run.catch(() => undefined)
  return run
}

type Change = { colour: string; size: string; delta: number }
const key = (colour: string, size: string) => `${colour}\u0000${size}`

/** All top-level fields, with empty ones as null, so a save replaces every value the draft might hold. */
function fullData(payload: Payload, doc: Product): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const field of payload.collections.products.config.flattenedFields) {
    if (!('name' in field) || ['id', 'createdAt', 'updatedAt'].includes(field.name)) continue
    const value = (doc as unknown as Record<string, unknown>)[field.name]
    out[field.name] = value === undefined ? null : value
  }
  return out
}

function applyChanges(doc: Product, changes: Change[]): Product['colours'] {
  const byKey = new Map(changes.map((c) => [key(c.colour, c.size), c.delta]))
  return (doc.colours ?? []).map((c) => ({
    ...c,
    sizes: (c.sizes ?? []).map((s) => {
      const delta = byKey.get(key(c.name, s.size)) ?? 0
      return delta ? { ...s, stock: Math.max(0, (s.stock ?? 0) + delta) } : s
    }),
  }))
}

/** Apply stock (and units-sold) changes to one product: the live version, plus any pending draft. */
async function adjustProduct(payload: Payload, id: number, changes: Change[], salesDelta: number): Promise<void> {
  const live = await payload.findByID({ collection: 'products', id, depth: 0, draft: false, overrideAccess: true }).catch(() => null)
  if (!live) return
  const latest = await payload.findByID({ collection: 'products', id, depth: 0, draft: true, overrideAccess: true }).catch(() => null)
  const pendingDraft = latest && latest._status === 'draft' && live._status === 'published' ? latest : null
  const context = { stockUpdate: true }

  await payload.update({
    collection: 'products',
    id,
    draft: false,
    overrideAccess: true,
    context,
    data: {
      ...fullData(payload, live),
      colours: applyChanges(live, changes),
      salesCount: Math.max(0, (live.salesCount ?? 0) + salesDelta),
    } as never,
  })

  if (pendingDraft) {
    await payload.update({
      collection: 'products',
      id,
      draft: true,
      overrideAccess: true,
      context,
      data: {
        ...fullData(payload, pendingDraft),
        _status: 'draft',
        colours: applyChanges(pendingDraft, changes),
        salesCount: Math.max(0, (pendingDraft.salesCount ?? 0) + salesDelta),
      } as never,
    })
  }
}

function byProduct(lines: StockLine[], sign: 1 | -1): Map<number, { changes: Change[]; sales: number }> {
  const map = new Map<number, { changes: Change[]; sales: number }>()
  for (const l of lines) {
    const qty = Math.max(0, Math.floor(Number(l.qty) || 0))
    if (!l.productId || !qty) continue
    const entry = map.get(l.productId) ?? { changes: [], sales: 0 }
    entry.changes.push({ colour: l.colour, size: l.size, delta: sign * qty })
    entry.sales += -sign * qty
    map.set(l.productId, entry)
  }
  return map
}

/** Problems that would stop these lines being taken from the live stock right now (empty = all fine). */
export async function stockProblems(payload: Payload, lines: StockLine[]): Promise<string[]> {
  const need = new Map<string, number>()
  for (const l of lines) need.set(`${l.productId}\u0000${key(l.colour, l.size)}`, (need.get(`${l.productId}\u0000${key(l.colour, l.size)}`) ?? 0) + l.qty)
  const problems: string[] = []
  const products = new Map<number, Product | null>()
  for (const l of lines) {
    if (!products.has(l.productId)) {
      products.set(l.productId, await payload.findByID({ collection: 'products', id: l.productId, depth: 0, draft: false, overrideAccess: true }).catch(() => null))
    }
    const p = products.get(l.productId)
    const label = `${p?.name ?? l.name ?? 'An item'} (${l.colour}, ${l.size})`
    if (!p || p._status !== 'published') {
      problems.push(`${label} is no longer available.`)
      continue
    }
    const stock = p.colours?.find((c) => c.name === l.colour)?.sizes?.find((s) => s.size === l.size)?.stock ?? 0
    const wanted = need.get(`${l.productId}\u0000${key(l.colour, l.size)}`) ?? l.qty
    if (stock <= 0) problems.push(`${label} just sold out.`)
    else if (stock < wanted) problems.push(`Only ${stock} left of ${label}.`)
  }
  return [...new Set(problems)]
}

async function take(payload: Payload, lines: StockLine[]): Promise<StockResult> {
  const problems = await stockProblems(payload, lines)
  if (problems.length) return { ok: false, problems }
  for (const [id, { changes, sales }] of byProduct(lines, -1)) await adjustProduct(payload, id, changes, sales)
  return { ok: true }
}

async function giveBack(payload: Payload, lines: StockLine[]): Promise<void> {
  for (const [id, { changes, sales }] of byProduct(lines, 1)) await adjustProduct(payload, id, changes, sales)
}

/** Take stock for an order, all or nothing: if anything is short, nothing is taken. */
export function reserveStock(payload: Payload, lines: StockLine[]): Promise<StockResult> {
  return withStockLock(() => take(payload, lines))
}

/** Put stock back (used by order hooks, which clear the order's flag in their own save). */
export function releaseStock(payload: Payload, lines: StockLine[]): Promise<void> {
  return withStockLock(() => giveBack(payload, lines))
}

type OrderData = Record<string, unknown>

/**
 * Make an order hold its stock again (a payment retried after its hold lapsed, or a switch to COD).
 * Re-reads the order inside the lock, so it never takes stock twice.
 */
export function holdOrder(payload: Payload, orderId: number, extra: OrderData = {}): Promise<StockResult> {
  return withStockLock(async () => {
    const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 0, overrideAccess: true })
    if (!order.stockCommitted) {
      const res = await take(payload, orderLines(order.items))
      if (!res.ok) return res
    }
    await payload.update({ collection: 'orders', id: orderId, overrideAccess: true, context: { stockFlag: true }, data: { ...extra, stockCommitted: true } as never })
    return { ok: true }
  })
}

/**
 * Give an order's stock back and save any other changes with it (payment failed, cancelled or
 * abandoned). Re-reads the order inside the lock, so stock is never returned twice.
 */
export function releaseOrder(payload: Payload, orderId: number, extra: OrderData = {}): Promise<void> {
  return withStockLock(async () => {
    const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 0, overrideAccess: true })
    await payload.update({ collection: 'orders', id: orderId, overrideAccess: true, context: { stockFlag: true }, data: { ...extra, stockCommitted: false } as never })
    if (order.stockCommitted) await giveBack(payload, orderLines(order.items))
  })
}

/** The stock lines of an order's items. */
export function orderLines(items: { product?: number | { id: number } | null; name?: string | null; colour?: string | null; size?: string | null; qty?: number | null }[]): StockLine[] {
  return items
    .map((i) => ({
      productId: (typeof i.product === 'object' ? i.product?.id : i.product) ?? 0,
      name: i.name ?? undefined,
      colour: i.colour ?? '',
      size: i.size ?? '',
      qty: i.qty ?? 0,
    }))
    .filter((l) => l.productId && l.qty > 0)
}
