'use client'

import { usePathname } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import type { CartLine } from '../../lib/types'

const KEY = 'dv-cart-v1'

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
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<Toast>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  // Load the saved cart once (localStorage can be unavailable in private mode).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) setLines(JSON.parse(raw) as CartLine[])
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* ignore */
    }
  }, [lines, ready])

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setLines(JSON.parse(e.newValue) as CartLine[])
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Close overlays when the page changes.
  useEffect(() => {
    setDrawerOpen(false)
    setSearchOpen(false)
    setMenuOpen(false)
  }, [pathname])

  // Lock page scroll while an overlay is open.
  useEffect(() => {
    document.body.classList.toggle('lock', drawerOpen || searchOpen || menuOpen)
  }, [drawerOpen, searchOpen, menuOpen])

  const add = useCallback((line: Omit<CartLine, 'key'>) => {
    const key = `${line.productId}|${line.colour}|${line.size}`
    let added: CartLine = { ...line, key }
    setLines((prev) => {
      const found = prev.find((l) => l.key === key)
      if (found) {
        added = { ...found, ...line, key, qty: Math.min(MAX_QTY, found.qty + line.qty) }
        return prev.map((l) => (l.key === key ? added : l))
      }
      return [...prev, added]
    })
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
      clear: () => setLines([]),
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
    [lines, ready, add, drawerOpen, searchOpen, menuOpen, toast],
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
