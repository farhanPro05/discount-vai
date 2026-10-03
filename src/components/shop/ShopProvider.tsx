'use client'

import { usePathname } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { trackAddToCart } from '../../lib/analytics'
import type { CartLine } from '../../lib/types'
import { useHydrated } from './storage'

const KEY = 'dv-cart-v1'
const EMPTY: CartLine[] = []

/* The cart lives in localStorage, read through a tiny external store (also keeps tabs in sync). */
const cartStore = (() => {
  let lines: CartLine[] | null = null
  const listeners = new Set<() => void>()
  const load = (): CartLine[] => {
    if (lines) return lines
    try {
      lines = JSON.parse(window.localStorage.getItem(KEY) || '[]') as CartLine[]
    } catch {
      lines = []
    }
    return lines
  }
  return {
    subscribe(cb: () => void) {
      listeners.add(cb)
      const onStorage = (e: StorageEvent) => {
        if (e.key !== KEY) return
        lines = null
        cb()
      }
      window.addEventListener('storage', onStorage)
      return () => {
        listeners.delete(cb)
        window.removeEventListener('storage', onStorage)
      }
    },
    get: load,
    getServer: () => EMPTY,
    set(update: (prev: CartLine[]) => CartLine[]) {
      lines = update(load())
      try {
        window.localStorage.setItem(KEY, JSON.stringify(lines))
      } catch {
        /* private mode: keep it in memory */
      }
      listeners.forEach((l) => l())
    },
  }
})()

type Toast = { line: CartLine } | null

type Shop = {
  lines: CartLine[]
  ready: boolean
  count: number
  subtotal: number
  add: (line: Omit<CartLine, 'key'>) => void
  setQty: (key: string, qty: number) => void
  patch: (key: string, change: Partial<Pick<CartLine, 'price' | 'was' | 'qty' | 'image'>>) => void
  remove: (key: string) => void
  clear: () => void
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void
  menuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
  toast: Toast
  hideToast: () => void
}

const ShopContext = createContext<Shop | null>(null)

export const MAX_QTY = 9

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(cartStore.subscribe, cartStore.get, cartStore.getServer)
  const ready = useHydrated()
  const setLines = cartStore.set
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<Toast>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  // Close overlays when the page changes (adjusting state during render, as React recommends).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setDrawerOpen(false)
    setSearchOpen(false)
    setMenuOpen(false)
  }

  // Lock page scroll while an overlay is open.
  useEffect(() => {
    document.body.classList.toggle('lock', drawerOpen || searchOpen || menuOpen)
  }, [drawerOpen, searchOpen, menuOpen])

  const add = useCallback((line: Omit<CartLine, 'key'>) => {
    const key = `${line.productId}|${line.colour}|${line.size}`
    let added: CartLine = { ...line, key }
    cartStore.set((prev) => {
      const found = prev.find((l) => l.key === key)
      if (found) {
        added = { ...found, ...line, key, qty: Math.min(MAX_QTY, found.qty + line.qty) }
        return prev.map((l) => (l.key === key ? added : l))
      }
      return [...prev, added]
    })
    trackAddToCart({ productId: line.productId, name: line.name, colour: line.colour, size: line.size, price: line.price, qty: line.qty })
    setToast({ line: added })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 6000)
  }, [])

  const value = useMemo<Shop>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
      add,
      setQty: (key, qty) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l))),
      patch: (key, change) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...change } : l))),
      remove: (key) => setLines((prev) => prev.filter((l) => l.key !== key)),
      clear: () => setLines(() => []),
      drawerOpen,
      openDrawer: () => {
        setToast(null)
        setDrawerOpen(true)
      },
      closeDrawer: () => setDrawerOpen(false),
      searchOpen,
      openSearch: () => {
        setMenuOpen(false)
        setSearchOpen(true)
      },
      closeSearch: () => setSearchOpen(false),
      menuOpen,
      openMenu: () => setMenuOpen(true),
      closeMenu: () => setMenuOpen(false),
      toast,
      hideToast: () => setToast(null),
    }),
    [lines, ready, add, setLines, drawerOpen, searchOpen, menuOpen, toast],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop(): Shop {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>')
  return ctx
}

/** Close on Escape. */
export function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onClose])
}
