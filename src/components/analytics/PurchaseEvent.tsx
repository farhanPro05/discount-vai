'use client'

import { useEffect } from 'react'

import { trackPurchase } from '../../lib/analytics'

type Props = { number: string; total: number; delivery: number; items: { productId: number; name: string; colour?: string | null; size?: string | null; price: number; qty: number }[] }

/** Reports a confirmed order once (reloading or revisiting the receipt doesn't count it again). */
export function PurchaseEvent(props: Props) {
  useEffect(() => {
    // Wait a moment so the analytics scripts have started on a fresh page, then send it once.
    const t = setTimeout(() => {
      const key = `dv-sent-${props.number}`
      try {
        if (window.localStorage.getItem(key)) return
        window.localStorage.setItem(key, '1')
      } catch {
        return
      }
      trackPurchase(props)
    }, 1500)
    return () => clearTimeout(t)
  }, [props])
  return null
}
