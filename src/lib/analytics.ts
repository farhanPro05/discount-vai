/* Shop events for Google Analytics 4 and the Meta Pixel. Safe to call anywhere: does nothing when neither is set up. */

type Fn = (...args: unknown[]) => void
type Item = { productId: number; name: string; colour?: string | null; size?: string | null; price: number; qty: number }

const w = () => (typeof window === 'undefined' ? null : (window as unknown as { gtag?: Fn; fbq?: Fn }))

/** Valid IDs only, so nothing odd ever reaches the inline scripts. */
export const cleanGa = (v?: string | null) => (v && /^G-[A-Z0-9]{4,20}$/.test(v) ? v : null)
export const cleanPixel = (v?: string | null) => (v && /^\d{8,20}$/.test(v) ? v : null)

const gaItems = (items: Item[]) =>
  items.map((i) => ({
    item_id: String(i.productId),
    item_name: i.name,
    item_variant: [i.colour, i.size].filter(Boolean).join(' / '),
    price: i.price,
    quantity: i.qty,
  }))

const value = (items: Item[]) => items.reduce((n, i) => n + i.price * i.qty, 0)

export function trackAddToCart(item: Item) {
  const win = w()
  win?.gtag?.('event', 'add_to_cart', { currency: 'BDT', value: item.price * item.qty, items: gaItems([item]) })
  win?.fbq?.('track', 'AddToCart', { content_ids: [String(item.productId)], content_name: item.name, content_type: 'product', value: item.price * item.qty, currency: 'BDT' })
}

export function trackBeginCheckout(items: Item[]) {
  const win = w()
  win?.gtag?.('event', 'begin_checkout', { currency: 'BDT', value: value(items), items: gaItems(items) })
  win?.fbq?.('track', 'InitiateCheckout', { content_ids: items.map((i) => String(i.productId)), num_items: items.reduce((n, i) => n + i.qty, 0), value: value(items), currency: 'BDT' })
}

export function trackPurchase(order: { number: string; total: number; delivery: number; items: Item[] }) {
  const win = w()
  win?.gtag?.('event', 'purchase', { transaction_id: order.number, currency: 'BDT', value: order.total, shipping: order.delivery, items: gaItems(order.items) })
  win?.fbq?.(
    'track',
    'Purchase',
    { content_ids: order.items.map((i) => String(i.productId)), content_type: 'product', num_items: order.items.reduce((n, i) => n + i.qty, 0), value: order.total, currency: 'BDT' },
    { eventID: order.number },
  )
}
