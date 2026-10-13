import { getClient } from '../../../../../lib/payload'
import { transactionOutcome, validatePayment } from '../../../../../lib/sslcommerz'
import { holdOrder, releaseOrder } from '../../../../../lib/stock'

/*
 * SSLCommerz sends the shopper's browser back here (success / fail / cancel) and also calls
 * /ipn server-to-server. A payment only counts once SSLCommerz's validation API confirms it.
 */

const go = (req: Request, path: string) => Response.redirect(new URL(path, req.url), 303)

export async function POST(req: Request, { params }: { params: Promise<{ result: string }> }) {
  const { result } = await params
  if (!['success', 'fail', 'cancel', 'ipn'].includes(result)) return new Response('Not found', { status: 404 })

  const form = await req.formData().catch(() => null)
  const tranId = String(form?.get('tran_id') ?? '')
  const valId = String(form?.get('val_id') ?? '')
  const payload = await getClient()
  const found = tranId
    ? await payload.find({ collection: 'orders', where: { 'payment.tranId': { equals: tranId } }, limit: 1, depth: 0 })
    : { docs: [] }
  const order = found.docs[0]
  if (!order) return result === 'ipn' ? new Response('Unknown transaction', { status: 404 }) : go(req, '/')

  const confirmUrl = `/order/${order.orderNumber}?t=${order.accessToken}`
  const failedUrl = `/order/${order.orderNumber}/payment-failed?t=${order.accessToken}`
  const alreadyPaid = order.paymentStatus === 'paid' || (order.paymentMethod === 'cod' && (order.advancePaid ?? 0) > 0)

  if (result === 'success' || result === 'ipn') {
    if (alreadyPaid) return result === 'ipn' ? new Response('OK') : go(req, confirmUrl)
    const v = await validatePayment(valId)
    const expected = order.paymentMethod === 'online' ? order.total : order.delivery
    if (v.valid && v.tranId === tranId && Math.abs((v.amount ?? 0) - expected) < 1) {
      // The money is in. If the order's hold lapsed while the customer paid, take the stock again;
      // if it has sold out (or the order was cancelled meanwhile), flag it for the shop to refund.
      let stockProblem: string | null = null
      if (['cancelled', 'returned'].includes(order.status)) {
        stockProblem = 'Paid after the order was cancelled. Refund the customer, or re-open the order.'
      } else {
        const held = await holdOrder(payload, order.id)
        if (!held.ok) stockProblem = `Paid, but: ${held.problems.join(' ')}`
      }
      await payload.update({
        collection: 'orders',
        id: order.id,
        overrideAccess: true,
        data: {
          paymentStatus: order.paymentMethod === 'online' ? 'paid' : 'unpaid_cod',
          advancePaid: order.paymentMethod === 'cod' ? expected : order.advancePaid,
          payment: { ...order.payment, tranId, valId, bankTranId: v.bankTranId ?? null, cardType: v.cardType ?? null, message: 'Payment confirmed' },
          stockProblem,
        },
      })
      return result === 'ipn' ? new Response('OK') : go(req, confirmUrl)
    }
    if (result === 'ipn') return new Response('Not valid', { status: 400 })
    // Not a valid payment: only mark it failed (and give the stock back) if SSLCommerz agrees.
    if ((await transactionOutcome(tranId)) === 'failed') {
      await releaseOrder(payload, order.id, { paymentStatus: 'failed', payment: { ...order.payment, message: 'We could not verify this payment.' } })
    }
    return go(req, failedUrl)
  }

  if (alreadyPaid) return go(req, confirmUrl)
  // A fail / cancel post is only believed once SSLCommerz confirms it. While the transaction is still
  // open (or SSLCommerz can't be reached) the order keeps its stock; the 45-minute job tidies up.
  const outcome = await transactionOutcome(tranId)
  if (outcome === 'paid') return go(req, confirmUrl)
  if (outcome === 'failed') {
    const reason = String(form?.get('error') ?? '') || (result === 'cancel' ? 'Transaction cancelled.' : 'Transaction failed or timed out.')
    // Give the stock back until the customer retries or switches to Cash on Delivery.
    await releaseOrder(payload, order.id, { paymentStatus: 'failed', payment: { ...order.payment, message: reason.slice(0, 200) } })
  }
  return go(req, failedUrl)
}

/** Someone opened a callback link directly. */
export function GET(req: Request) {
  return go(req, '/')
}
