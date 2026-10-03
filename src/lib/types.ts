/* Plain, serialisable shapes passed from server to client components. */
import type { ShapeKey } from '../fields/shapes'

export type Img = { url: string; alt: string; width: number; height: number }

export type CardColour = { name: string; hex: string; images: Img[] }

export type CardProduct = {
  id: number
  slug: string
  href: string
  name: string
  category: string
  colours: CardColour[]
  price: number
  was: number
  onSale: boolean
  discount: number
  isNew: boolean
  out: boolean
  shape: ShapeKey
}

export type NavLink = { label: string; href: string; soon: boolean; group?: string | null }

export type NavCategory = NavLink & {
  id: number
  slug: string
  children: (NavLink & { id: number; slug: string; tileText?: string | null; shape?: ShapeKey | null; image?: Img | null })[]
}

export type FeatureTile = {
  eyebrow?: string | null
  title?: string | null
  linkLabel?: string | null
  link?: string | null
  image?: Img | null
}

export type CartLine = {
  key: string
  productId: number
  slug: string
  name: string
  colour: string
  size: string
  qty: number
  price: number
  was: number
  image?: Img | null
  shape: ShapeKey
  hex: string
}
