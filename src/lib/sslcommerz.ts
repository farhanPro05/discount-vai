/* SSLCommerz hosted checkout (v4). Switched on in the admin (Delivery & payment) once
   SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD are set in the server's .env. */
import type { Order } from '../payload-types'
import { SITE_URL } from './format'

const sandbox = () => process.env.SSLCOMMERZ_SANDBOX !== 'false'
const base = () => (sandbox() ? 'https://sandbox.sslcommerz.com' : 'https://securepay.sslcommerz.com')
const creds = () => ({ store_id: process.env.SSLCOMMERZ_STORE_ID ?? '', store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD ?? '' })

export const sslcommerzReady = (): boolean => !!(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD)

/** Start a payment session. Returns the gateway page to send the customer to. */
export async function startPayment(order: Order, amount: number, tranId: string): Promise<{ url: string } | { error: string }> {
  if (!sslcommerzReady()) return { error: 'Online payment is not set up yet.' }
  const back = (result: string) => `${SITE_URL}/payment/sslcommerz/${result}`
  const body = new URLSearchParams({
    ...creds(),
    total_amount: amount.toFixed(2),
    currency: 'BDT',
    tran_id: tranId,
    success_url: back('success'),
    fail_url: back('fail'),
    cancel_url: back('cancel'),
    ipn_url: back('ipn'),
    value_a: order.orderNumber,
    cus_name: order.contact.name,
    cus_email: order.contact.email || 'no-email@discountvai.invalid',
    cus_phone: order.contact.phone,
    cus_add1: order.address.line,
    cus_city: order.address.district,
    cus_country: 'Bangladesh',
    shipping_method: 'Courier',
    num_of_item: String(order.items.reduce((n, i) => n + i.qty, 0)),
    product_name: order.items.map((i) => i.name).join(', ').slice(0, 250),
    product_category: 'Clothing',
    product_profile: 'physical-goods',
    ship_name: order.contact.name,
    ship_add1: order.address.line,
    ship_city: order.address.district,
    ship_postcode: '1000',
    ship_country: 'Bangladesh',
  })
  try {
    const res = await fetch(`${base()}/gwprocess/v4/api.php`, { method: 'POST', body, cache: 'no-store' })
    const json = (await res.json()) as { status?: string; GatewayPageURL?: string; failedreason?: string }
    if (json.status === 'SUCCESS' && json.GatewayPageURL) return { url: json.GatewayPageURL }
    return { error: json.failedreason || 'The payment gateway did not respond.' }
  } catch {
    return { error: 'Could not reach the payment gateway.' }
  }
}

export type Validation = { valid: boolean; tranId?: string; amount?: number; bankTranId?: string; cardType?: string; status?: string }

/** Ask SSLCommerz whether a payment is genuine (never trust the browser's redirect alone). */
export async function validatePayment(valId: string): Promise<Validation> {
  if (!valId || !sslcommerzReady()) return { valid: false }
  const q = new URLSearchParams({ val_id: valId, ...creds(), format: 'json' })
  try {
    const res = await fetch(`${base()}/validator/api/validationserverAPI.php?${q}`, { cache: 'no-store' })
    const j = (await res.json()) as { status?: string; tran_id?: string; amount?: string; bank_tran_id?: string; card_type?: string }
    const valid = j.status === 'VALID' || j.status === 'VALIDATED'
    return { valid, tranId: j.tran_id, amount: Number(j.amount), bankTranId: j.bank_tran_id, cardType: j.card_type, status: j.status }
  } catch {
    return { valid: false }
  }
}

export type Outcome = 'paid' | 'failed' | 'pending' | 'unknown'

/**
 * What SSLCommerz itself says happened to a transaction. The fail / cancel callbacks are plain browser
 * posts anyone could forge, so the order is only changed when SSLCommerz confirms the result.
 */
export async function transactionOutcome(tranId: string): Promise<Outcome> {
  if (!tranId || !sslcommerzReady()) return 'unknown'
  const q = new URLSearchParams({ tran_id: tranId, ...creds(), format: 'json' })
  try {
    const res = await fetch(`${base()}/validator/api/merchantTransIDvalidationAPI.php?${q}`, { cache: 'no-store' })
    const j = (await res.json()) as { APIConnect?: string; element?: { status?: string }[] }
    if (j.APIConnect !== 'DONE') return 'unknown'
    const statuses = (j.element ?? []).map((e) => String(e.status ?? '').toUpperCase())
    if (statuses.some((s) => s === 'VALID' || s === 'VALIDATED')) return 'paid'
    if (statuses.some((s) => s === 'FAILED' || s === 'CANCELLED' || s === 'EXPIRED')) return 'failed'
    return 'pending'
  } catch {
    return 'unknown'
  }
}
