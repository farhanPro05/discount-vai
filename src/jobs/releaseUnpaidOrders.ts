import type { TaskConfig } from 'payload'

import { releaseOrder } from '../lib/stock'

/** How long an online order holds its items while the customer pays. */
export const HOLD_MINUTES = 45

/**
 * Every 5 minutes: give back the stock of online orders whose payment was never completed (the
 * customer closed the payment page). The customer can still retry from their order link; the items
 * are taken again then, if they're still in stock.
 */
export const releaseUnpaidOrders: TaskConfig<{ input: Record<string, never>; output: { released: number } }> = {
  slug: 'releaseUnpaidOrders',
  schedule: [{ cron: '*/5 * * * *', queue: 'default' }],
  handler: async ({ req }) => {
    const cutoff = new Date(Date.now() - HOLD_MINUTES * 60_000).toISOString()
    const { docs } = await req.payload.find({
      collection: 'orders',
      where: { and: [{ paymentStatus: { equals: 'pending' } }, { stockCommitted: { equals: true } }, { updatedAt: { less_than: cutoff } }] },
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })
    for (const order of docs) {
      await releaseOrder(req.payload, order.id, {
        paymentStatus: 'failed',
        payment: { ...(order.payment ?? {}), message: 'The payment was not completed in time, so the items were released.' },
      })
    }
    return { output: { released: docs.length } }
  },
}
