'use client'

import { useEffect, useRef, useState } from 'react'

import { priceCartAction } from '../../app/(frontend)/actions'
import { useShop } from './ShopProvider'

/**
 * Re-check the saved cart against current prices and stock (prices may have changed since the
 * items were added). Updates prices, trims quantities and removes items that sold out.
 */
export function useCartSync() {
  const { lines, ready, patch, remove } = useShop()
  const [problems, setProblems] = useState<string[]>([])
  const [synced, setSynced] = useState(false)
  const done = useRef(false)

  useEffect(() => {
    if (!ready || done.current) return
    done.current = true
    if (!lines.length) return
    priceCartAction(lines.map((l) => ({ productId: l.productId, colour: l.colour, size: l.size, qty: l.qty })))
      .then((res) => {
        const seen = new Set<string>()
        for (const item of res.items) {
          const key = `${item.productId}|${item.colour}|${item.size}`
          seen.add(key)
          const line = lines.find((l) => l.key === key)
          if (!line) continue
          if (line.qty !== item.qty || line.price !== item.unitPrice || line.was !== item.originalPrice) {
            patch(key, { qty: item.qty, price: item.unitPrice, was: item.originalPrice })
          }
        }
        for (const l of lines) if (!seen.has(l.key)) remove(l.key)
        setProblems(res.problems)
      })
      .catch(() => null)
      .finally(() => setSynced(true))
  }, [ready, lines, patch, remove])

  return { problems, synced: synced || (ready && !lines.length) }
}
