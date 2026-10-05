import { cache } from 'react'

import { getClient } from './payload'

/* Admin-editable settings, read once per request. */

export const getBrand = cache(async () => (await getClient()).findGlobal({ slug: 'brand', depth: 1 }))
export const getSite = cache(async () => (await getClient()).findGlobal({ slug: 'site', depth: 1 }))
export const getHome = cache(async () => (await getClient()).findGlobal({ slug: 'home', depth: 2 }))
export const getPopup = cache(async () => (await getClient()).findGlobal({ slug: 'popup', depth: 1 }))
export const getCommerce = cache(async () => (await getClient()).findGlobal({ slug: 'commerce', depth: 0 }))
export const getFaq = cache(async () => (await getClient()).findGlobal({ slug: 'faq', depth: 0 }))

/** Delivery charge for a zone and subtotal, using the admin's settings. */
export async function deliveryFee(zone: 'inside' | 'outside', subtotal: number): Promise<number> {
  const c = await getCommerce()
  if (c.freeDeliveryOver && subtotal >= c.freeDeliveryOver) return 0
  return zone === 'inside' ? c.inside.fee : c.outside.fee
}

export type CommerceInfo = {
  inside: { fee: number; eta: string }
  outside: { fee: number; eta: string }
  freeOver: number | null
  exchangeDays: number
  codEnabled: boolean
  codZones: ('inside' | 'outside')[]
  codAdvance: boolean
  onlineEnabled: boolean
  onlineLabels: string[]
  nextSteps: { call: string; ship: string }
}

/** Plain version of the delivery & payment settings for client components. */
export async function getCommerceInfo(): Promise<CommerceInfo> {
  const c = await getCommerce()
  const sslReady = !!(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD)
  return {
    inside: c.inside,
    outside: c.outside,
    freeOver: c.freeDeliveryOver ?? null,
    exchangeDays: c.exchangeDays ?? 7,
    codEnabled: c.codEnabled !== false,
    codZones: c.codZones?.length ? c.codZones : ['inside', 'outside'],
    codAdvance: !!c.codAdvanceDelivery && !!c.onlineEnabled && sslReady,
    onlineEnabled: !!c.onlineEnabled && sslReady,
    onlineLabels: (c.onlineLabels || 'bKash, Nagad, Visa, Mastercard')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    nextSteps: {
      call: c.nextSteps?.call || 'Within 2 hours, between 9 am and 10 pm.',
      ship: c.nextSteps?.ship || 'Same or next day. The courier contacts you before delivering.',
    },
  }
}
