import type { Field } from 'payload'

/** Garment outlines used as placeholders until real photos are uploaded. Paths come from the mockups. */
export const SHAPES = {
  panjabi:
    'M37 14 L45 11 Q50 17 55 11 L63 14 L77 21 L86 74 L77 76 L70 38 L71 116 L29 116 L30 38 L23 76 L14 74 L23 21 Z M49.2 16 L50.8 16 L50.8 44 L49.2 44 Z',
  tee: 'M31 24 L42 19 Q50 26 58 19 L69 24 L87 38 L79 51 L70 45 L70 102 L30 102 L30 45 L21 51 L13 38 Z',
  jersey: 'M31 24 L43 19 L50 30 L57 19 L69 24 L86 36 L78 48 L70 43 L70 102 L30 102 L30 43 L22 48 L14 36 Z',
  jacket:
    'M33 21 L44 17 L50 23 L56 17 L67 21 L80 29 L87 86 L77 88 L70 44 L70 100 L30 100 L30 44 L23 88 L13 86 L20 29 Z M49.3 23 L50.7 23 L50.7 100 L49.3 100 Z',
  trouser: 'M32 12 L68 12 L73 116 L56 116 L50 44 L44 116 L27 116 Z',
  shorts: 'M29 32 L71 32 L75 86 L54 88 L50 58 L46 88 L25 86 Z',
  half: 'M30 34 L70 34 L73 80 L54 82 L50 58 L46 82 L27 80 Z',
  three4: 'M31 18 L69 18 L73 100 L55 100 L50 52 L45 100 L27 100 Z',
  tote: 'M27 50 L73 50 L77 112 L23 112 Z M38 50 Q38 25 50 25 Q62 25 62 50 L58 50 Q58 30 50 30 Q42 30 42 50 Z',
  backpack:
    'M29 36 Q29 22 50 22 Q71 22 71 36 L73 110 L27 110 Z M44 22 Q44 12 50 12 Q56 12 56 22 L53 22 Q53 15.5 50 15.5 Q47 15.5 47 22 Z M36 76 L64 76 L64 100 L36 100 Z',
  sling:
    'M28 62 Q28 54 36 54 L64 54 Q72 54 72 62 L72 98 Q72 106 64 106 L36 106 Q28 106 28 98 Z M33 54 L66 12 L69.5 14.5 L38 54 Z',
  duffel:
    'M18 58 Q18 48 28 48 L72 48 Q82 48 82 58 L82 96 Q82 104 74 104 L26 104 Q18 104 18 96 Z M38 48 Q38 32 50 32 Q62 32 62 48 L58 48 Q58 36 50 36 Q42 36 42 48 Z',
  waist:
    'M18 70 Q18 58 32 58 L68 58 Q82 58 82 70 Q82 84 68 86 L32 86 Q18 84 18 70 Z M6 66 L18 66 L18 72 L6 72 Z M82 66 L94 66 L94 72 L82 72 Z',
} as const

export type ShapeKey = keyof typeof SHAPES

const LABELS: Record<ShapeKey, string> = {
  panjabi: 'Panjabi',
  tee: 'T-shirt',
  jersey: 'Jersey',
  jacket: 'Jacket',
  trouser: 'Trousers',
  shorts: 'Shorts',
  half: 'Half pant',
  three4: '3/4 pant',
  tote: 'Tote bag',
  backpack: 'Backpack',
  sling: 'Sling bag',
  duffel: 'Duffel bag',
  waist: 'Waist bag',
}

export const shapeOptions = (Object.keys(SHAPES) as ShapeKey[]).map((value) => ({ label: LABELS[value], value }))

export const shapeField = (description: string): Field => ({
  name: 'shape',
  type: 'select',
  label: 'Placeholder outline',
  options: shapeOptions,
  admin: { position: 'sidebar', description },
})
