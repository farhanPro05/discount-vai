/* Dummy catalogue and copy from the approved mockups (design/claude-design-mockups/dvdata.js
   and the page components). Placeholder content only; the owner replaces it in the admin. */
import type { ShapeKey } from '../fields/shapes'

export type SeedProduct = {
  id: number
  n: string
  c: string
  k: ShapeKey
  p: number
  s?: number
  f: string
  sw: string[]
  nw?: 1
  out?: 1
  z?: string
}

export const CATALOGUE: SeedProduct[] = [
  { id: 1, n: 'Slim Fit Cotton Chino', c: 'Khaki', k: 'trouser', p: 1850, s: 1450, f: '#B9A57E', sw: ['#B9A57E', '#2F3B4C', '#3B3B39'], z: '28–40' },
  { id: 2, n: 'Relaxed Twill Trouser', c: 'Charcoal', k: 'trouser', p: 1950, f: '#47484C', sw: ['#47484C', '#B9A57E'], z: '28–40' },
  { id: 3, n: 'Everyday Cotton Shorts', c: 'Navy', k: 'shorts', p: 890, s: 690, f: '#2E3B57', sw: ['#2E3B57', '#7C8A6A', '#D8D2C4'] },
  { id: 4, n: 'Drawstring Linen-Blend Shorts', c: 'Olive', k: 'shorts', p: 990, f: '#737A52', sw: ['#737A52', '#D9CFBA'] },
  { id: 5, n: 'Cargo 3/4 Pant', c: 'Stone', k: 'three4', p: 1150, s: 950, f: '#BDB4A3', sw: ['#BDB4A3', '#3C3C3A', '#6E7550'], nw: 1 },
  { id: 6, n: 'Jogger 3/4 Pant', c: 'Black', k: 'three4', p: 1050, f: '#2B2B2C', sw: ['#2B2B2C', '#7D7F84'] },
  { id: 7, n: 'Cotton Half Pant', c: 'Grey Melange', k: 'half', p: 750, s: 590, f: '#A9A9A6', sw: ['#A9A9A6', '#2E3B57', '#2B2B2C'] },
  { id: 8, n: 'Printed Half Pant', c: 'Teal', k: 'half', p: 790, f: '#3E7A78', sw: ['#3E7A78', '#C7B79A'] },
  { id: 9, n: 'Home Club Jersey 25/26', c: 'Red/White', k: 'jersey', p: 1250, f: '#B5524A', sw: ['#B5524A'] },
  { id: 10, n: 'Away Club Jersey 25/26', c: 'Sky Blue', k: 'jersey', p: 1250, s: 1050, f: '#8DB3D3', sw: ['#8DB3D3', '#F2F0EA'], nw: 1 },
  { id: 11, n: 'Lightweight Bomber Jacket', c: 'Olive', k: 'jacket', p: 3250, s: 2650, f: '#66704A', sw: ['#66704A', '#2B2B2C', '#BDB4A3'], nw: 1, z: 'M–XXL' },
  { id: 12, n: 'Denim Trucker Jacket', c: 'Mid Blue', k: 'jacket', p: 3450, f: '#5D7A9E', sw: ['#5D7A9E', '#2F3B4C'], z: 'M–XXL' },
  { id: 13, n: 'Oversized Drop-Shoulder Tee', c: 'Off-White', k: 'tee', p: 690, s: 550, f: '#F3F0E8', sw: ['#F3F0E8', '#2B2B2C', '#9DAE97', '#C9A98A'], nw: 1 },
  { id: 14, n: 'Graphic Drop-Shoulder Tee', c: 'Black', k: 'tee', p: 750, f: '#2A2A2B', sw: ['#2A2A2B', '#F3F0E8'] },
  { id: 15, n: 'Classic Cotton Panjabi', c: 'White', k: 'panjabi', p: 2450, s: 1990, f: '#F7F5F0', sw: ['#F7F5F0', '#9DAE97', '#2E3A57'] },
  { id: 16, n: 'Embroidered Festive Panjabi', c: 'Maroon', k: 'panjabi', p: 3850, f: '#7A2E36', sw: ['#7A2E36', '#2F5146'] },
  { id: 17, n: 'Slub Cotton Panjabi', c: 'Sage', k: 'panjabi', p: 2250, f: '#9DAE97', sw: ['#9DAE97', '#F7F5F0', '#D6C6A6'] },
  { id: 18, n: 'Everyday Canvas Tote', c: 'Natural', k: 'tote', p: 950, f: '#E3D7BE', sw: ['#E3D7BE', '#2B2B2C'], nw: 1, z: 'One size' },
  { id: 19, n: 'Urban Backpack', c: 'Black', k: 'backpack', p: 2450, s: 1990, f: '#2C2C2E', sw: ['#2C2C2E', '#66704A'], z: 'One size' },
  { id: 20, n: 'Crossbody Sling Bag', c: 'Brown', k: 'sling', p: 1350, f: '#7B5638', sw: ['#7B5638', '#2C2C2E'], z: 'One size' },
  { id: 21, n: 'Linen-Blend Panjabi', c: 'Sand', k: 'panjabi', p: 2650, s: 2190, f: '#D6C6A6', sw: ['#D6C6A6', '#F7F5F0'], nw: 1 },
  { id: 22, n: 'Kabli-Collar Panjabi', c: 'Navy', k: 'panjabi', p: 2850, f: '#2E3A57', sw: ['#2E3A57', '#47484C'] },
  { id: 23, n: 'Printed Cotton Panjabi', c: 'Indigo', k: 'panjabi', p: 2350, s: 1850, f: '#44507A', sw: ['#44507A', '#7A2E36'] },
  { id: 24, n: 'Short Kurta Panjabi', c: 'Off-White', k: 'panjabi', p: 1950, f: '#EFEBE1', sw: ['#EFEBE1'], out: 1 },
  { id: 25, n: 'Jacquard Festive Panjabi', c: 'Bottle Green', k: 'panjabi', p: 3650, s: 2990, f: '#2F5146', sw: ['#2F5146', '#7A2E36', '#CDB98A'], nw: 1 },
  { id: 26, n: 'Pintuck Cotton Panjabi', c: 'Sky', k: 'panjabi', p: 2550, f: '#A9C3D6', sw: ['#A9C3D6', '#F7F5F0'] },
  { id: 27, n: 'Mandarin-Collar Panjabi', c: 'Charcoal', k: 'panjabi', p: 2750, s: 2290, f: '#4A4B50', sw: ['#4A4B50', '#2E3A57'] },
  { id: 28, n: 'Check Cotton Panjabi', c: 'Rust', k: 'panjabi', p: 2150, f: '#A0583A', sw: ['#A0583A', '#D6C6A6'], nw: 1 },
  { id: 29, n: 'Silk-Blend Festive Panjabi', c: 'Gold Beige', k: 'panjabi', p: 4250, s: 3450, f: '#CDB98A', sw: ['#CDB98A', '#F7F5F0'] },
  { id: 30, n: 'Mini Crossbody Bag', c: 'Olive', k: 'sling', p: 1150, s: 890, f: '#66704A', sw: ['#66704A', '#7B5638'], z: 'One size' },
  { id: 31, n: 'Laptop Backpack', c: 'Grey', k: 'backpack', p: 2850, f: '#7D7F84', sw: ['#7D7F84', '#2C2C2E'], nw: 1, z: 'One size' },
  { id: 32, n: 'Weekender Duffel', c: 'Navy', k: 'duffel', p: 3250, s: 2690, f: '#2E3B57', sw: ['#2E3B57', '#7B5638'], z: 'One size' },
  { id: 33, n: 'Canvas Drawstring Bag', c: 'Black', k: 'tote', p: 650, f: '#2B2B2C', sw: ['#2B2B2C', '#E3D7BE'], z: 'One size' },
  { id: 34, n: 'Everyday Waist Bag', c: 'Black', k: 'waist', p: 850, f: '#2C2C2E', sw: ['#2C2C2E', '#66704A'], z: 'One size' },
  { id: 35, n: 'Market Tote', c: 'Indigo', k: 'tote', p: 1050, s: 850, f: '#44507A', sw: ['#44507A', '#E3D7BE'], z: 'One size' },
]

/** New arrivals (newest first) and best sellers, from the mockups. */
export const NEW_ARRIVALS = [21, 13, 11, 25, 10, 5, 18, 28]
export const BEST_SELLERS = [15, 1, 3, 19, 14, 7, 12, 16]
export const FEATURED = [15, 16, 25, 23]

/** Names for the extra swatch colours in the mockups. */
export const HEX_NAMES: Record<string, string> = {
  '#2F3B4C': 'Navy',
  '#3B3B39': 'Charcoal',
  '#B9A57E': 'Khaki',
  '#7C8A6A': 'Olive',
  '#D8D2C4': 'Stone',
  '#D9CFBA': 'Sand',
  '#3C3C3A': 'Charcoal',
  '#6E7550': 'Olive',
  '#7D7F84': 'Grey',
  '#2E3B57': 'Navy',
  '#2B2B2C': 'Black',
  '#C7B79A': 'Sand',
  '#F2F0EA': 'White',
  '#BDB4A3': 'Stone',
  '#9DAE97': 'Sage',
  '#C9A98A': 'Tan',
  '#F3F0E8': 'Off-White',
  '#2E3A57': 'Navy',
  '#2F5146': 'Bottle Green',
  '#7A2E36': 'Maroon',
  '#D6C6A6': 'Sand',
  '#2C2C2E': 'Black',
  '#66704A': 'Olive',
  '#7B5638': 'Brown',
  '#E3D7BE': 'Natural',
  '#CDB98A': 'Gold Beige',
  '#F7F5F0': 'White',
  '#47484C': 'Charcoal',
}

export const CATEGORY_FOR_SHAPE: Record<ShapeKey, string> = {
  trouser: 'trousers',
  shorts: 'shorts',
  three4: '3-4-pants',
  half: 'half-pants',
  jersey: 'club-jerseys',
  jacket: 'jackets',
  tee: 'drop-shoulder-t-shirts',
  panjabi: 'panjabi',
  tote: 'bags',
  backpack: 'bags',
  sling: 'bags',
  duffel: 'bags',
  waist: 'bags',
}

export const TYPE_COPY: Record<
  ShapeKey,
  { type: string; fit: string; fabric: string; care: string; guide?: string; code: string; blurb: string }
> = {
  panjabi: {
    type: 'Panjabi',
    fit: 'Regular fit, knee length',
    fabric: '100% cotton',
    care: 'Machine wash cold, dry in shade, iron medium',
    guide: 'Panjabi',
    code: 'PJ',
    blurb: 'A comfortable Panjabi cut for long festive days and everyday wear. Mandarin collar, hidden placket and side pockets.',
  },
  tee: {
    type: 'Drop tee',
    fit: 'Oversized, drop shoulder',
    fabric: '100% cotton jersey, 180 GSM',
    care: 'Machine wash cold, inside out',
    guide: 'Tops',
    code: 'DT',
    blurb: 'A relaxed drop-shoulder tee in soft, heavy cotton that keeps its shape wash after wash.',
  },
  jersey: {
    type: 'Club jersey',
    fit: 'Regular fit',
    fabric: 'Breathable polyester mesh',
    care: 'Machine wash cold, do not iron the print',
    guide: 'Tops',
    code: 'CJ',
    blurb: 'A lightweight, quick-dry club jersey for match days, five-a-side and everything in between.',
  },
  jacket: {
    type: 'Jacket',
    fit: 'Regular fit',
    fabric: 'Cotton-blend shell, polyester lining',
    care: 'Machine wash cold, hang dry',
    guide: 'Jackets',
    code: 'JK',
    blurb: 'An easy layer for cool evenings and air-conditioned offices, with deep pockets and a clean finish.',
  },
  trouser: {
    type: 'Trousers',
    fit: 'Slim through the leg',
    fabric: '98% cotton, 2% elastane',
    care: 'Machine wash cold, iron medium',
    guide: 'Trousers',
    code: 'TR',
    blurb: 'Smart enough for work, easy enough for weekends. A little stretch keeps them comfortable all day.',
  },
  shorts: {
    type: 'Shorts',
    fit: 'Regular fit, above the knee',
    fabric: 'Cotton and linen-blend',
    care: 'Machine wash cold',
    guide: 'Shorts & half pants',
    code: 'SH',
    blurb: 'Breathable everyday shorts with an elastic back waist and deep pockets.',
  },
  half: {
    type: '2/4 pant',
    fit: 'Relaxed half pant',
    fabric: 'Soft cotton',
    care: 'Machine wash cold',
    guide: 'Shorts & half pants',
    code: 'HP',
    blurb: 'A relaxed half pant for home, the gym and hot afternoons.',
  },
  three4: {
    type: '3/4 pant',
    fit: 'Relaxed, below the knee',
    fabric: 'Cotton twill',
    care: 'Machine wash cold',
    guide: '3/4 pants',
    code: 'TQ',
    blurb: 'A 3/4 pant that sits just below the knee, with roomy cargo pockets.',
  },
  tote: { type: 'Tote bag', fit: 'One size', fabric: 'Heavy cotton canvas', care: 'Spot clean', code: 'TB', blurb: 'A roomy tote that carries a laptop, groceries and everything else.' },
  backpack: { type: 'Backpack', fit: 'One size, 20 L', fabric: 'Water-resistant polyester', care: 'Spot clean', code: 'BP', blurb: 'A tough everyday backpack with a padded laptop sleeve and comfortable straps.' },
  sling: { type: 'Sling bag', fit: 'One size', fabric: 'Water-resistant polyester', care: 'Spot clean', code: 'SB', blurb: 'A compact crossbody bag for your phone, wallet and keys.' },
  duffel: { type: 'Duffel bag', fit: 'One size, 40 L', fabric: 'Canvas with faux-leather trim', care: 'Spot clean', code: 'DF', blurb: 'A weekender duffel with a shoe compartment and a detachable strap.' },
  waist: { type: 'Waist bag', fit: 'One size, adjustable strap', fabric: 'Water-resistant polyester', care: 'Spot clean', code: 'WB', blurb: 'A hands-free waist bag that also works as a crossbody.' },
}

export const SIZE_GUIDES = [
  {
    name: 'Panjabi',
    columns: 'Chest, Length, Shoulder, Sleeve',
    rows: [
      ['S', '38, 40, 17, 23'],
      ['M', '40, 41, 17.5, 23.5'],
      ['L', '42, 42, 18, 24'],
      ['XL', '44, 43, 18.5, 24.5'],
      ['XXL', '46, 44, 19, 25'],
    ],
    howToMeasure: [
      ['Chest', 'around the fullest part, under the arms, tape level.'],
      ['Length', 'from the top of the shoulder down to where you want the hem.'],
      ['Sleeve', 'from the shoulder seam to the wrist.'],
    ],
    tip: 'Between sizes? Go one up for a relaxed festive fit.',
  },
  {
    name: 'Tops',
    columns: 'Chest, Length, Shoulder, Sleeve',
    rows: [
      ['S', '42, 27, 20, 8'],
      ['M', '44, 28, 21, 8.5'],
      ['L', '46, 29, 22, 9'],
      ['XL', '48, 30, 23, 9.5'],
      ['XXL', '50, 31, 24, 10'],
    ],
    howToMeasure: [
      ['Chest', 'around the fullest part, under the arms.'],
      ['Length', 'from the highest point of the shoulder to the hem.'],
    ],
    tip: 'Drop-shoulder tees are cut roomy. Size down for a closer fit.',
  },
  {
    name: 'Jackets',
    columns: 'Chest, Length, Shoulder, Sleeve',
    rows: [
      ['M', '42, 26, 18, 25'],
      ['L', '44, 27, 18.5, 25.5'],
      ['XL', '46, 28, 19, 26'],
      ['XXL', '48, 29, 19.5, 26.5'],
    ],
    howToMeasure: [
      ['Chest', 'around the fullest part, over a light shirt.'],
      ['Sleeve', 'from the shoulder seam to the wrist.'],
    ],
    tip: 'Wearing it over a hoodie? Go one size up.',
  },
  {
    name: 'Trousers',
    columns: 'Waist, Hip, Length, Thigh',
    rows: [
      ['28', '28, 38, 40, 11.5'],
      ['30', '30, 40, 40.5, 12'],
      ['32', '32, 42, 41, 12.5'],
      ['34', '34, 44, 41.5, 13'],
      ['36', '36, 46, 42, 13.5'],
      ['38', '38, 48, 42, 14'],
      ['40', '40, 50, 42.5, 14.5'],
    ],
    howToMeasure: [
      ['Waist', 'around your natural waistline, where you wear your belt.'],
      ['Length', 'from the waistband down to the hem.'],
    ],
    tip: 'Sizes are waist sizes in inches.',
  },
  {
    name: 'Shorts & half pants',
    columns: 'Waist, Hip, Length',
    rows: [
      ['S', '29, 40, 19'],
      ['M', '31, 42, 19.5'],
      ['L', '33, 44, 20'],
      ['XL', '35, 46, 20.5'],
      ['XXL', '37, 48, 21'],
    ],
    howToMeasure: [
      ['Waist', 'around your natural waistline. The elastic back stretches about 2".'],
      ['Length', 'from the waistband down to the hem.'],
    ],
    tip: 'Between sizes? Go one down; the waist stretches.',
  },
  {
    name: '3/4 pants',
    columns: 'Waist, Hip, Length',
    rows: [
      ['S', '29, 40, 28'],
      ['M', '31, 42, 28.5'],
      ['L', '33, 44, 29'],
      ['XL', '35, 46, 29.5'],
      ['XXL', '37, 48, 30'],
    ],
    howToMeasure: [
      ['Waist', 'around your natural waistline.'],
      ['Length', 'from the waistband to just below the knee.'],
    ],
    tip: 'Between sizes? Go one down; the waist stretches.',
  },
]

export const MEN_FAQS = [
  ['How do I find my size?', 'Every product page has a Size Guide with chest, length and waist in inches. If you are between sizes, go one up for a relaxed fit.'],
  ['How much is delivery?', 'Inside Dhaka ৳70 (1 to 2 days), outside Dhaka ৳130 (2 to 4 days). Free on orders over ৳2,000.'],
  ['Can I exchange if it does not fit?', 'Yes. Exchange any unworn item within 7 days of delivery. We pick it up and drop the new size.'],
  ['Can I pay on delivery?', 'Yes, Cash on Delivery works everywhere in Bangladesh. You can also pay online with bKash, Nagad or card.'],
]

export const PANJABI_FAQS = [
  ['Do your Panjabi run true to size?', 'Yes, our Panjabi use a regular fit. Check the Size Guide for chest and length; size up for a looser festive look.'],
  ['Will my order arrive before Eid?', 'Order at least 4 days before Eid outside Dhaka and 2 days inside Dhaka. Festive rush dates are shown at checkout.'],
  ['How should I wash embroidered Panjabi?', 'Hand wash cold, inside out, and dry in shade. Iron on the reverse side to protect the embroidery.'],
  ['Can I exchange a Panjabi after Eid?', 'Unworn items with tags can be exchanged within 7 days of delivery, festive season included.'],
]

export const FAQ_GROUPS = [
  {
    title: 'Orders and payment',
    questions: [
      ['Can I pay Cash on Delivery?', 'Yes. Cash on Delivery works anywhere in Bangladesh. We call to confirm before we ship.'],
      ['Which online payments do you take?', 'bKash, Nagad, Visa and Mastercard, all through SSLCommerz’s secure page.'],
      ['Do I need an account to order?', 'No. Guest checkout only needs your phone number and address.'],
    ],
  },
  {
    title: 'Delivery',
    questions: [
      ['How much is delivery?', 'Inside Dhaka ৳70, outside Dhaka ৳130. Free on orders over ৳2,000.'],
      ['How long does it take?', '1 to 2 days inside Dhaka, 2 to 4 days elsewhere. Festive seasons can add a day.'],
      ['How do I track my order?', 'Use Track Order in the menu, or the SMS link we send when it ships.'],
    ],
  },
  {
    title: 'Exchanges',
    questions: [
      ['How long do I have to exchange?', '7 days from delivery. Items must be unworn with tags on.'],
      ['Is the exchange free?', 'Pickup is free inside Dhaka. Outside Dhaka it costs ৳70.'],
      ['Can I exchange a sale item?', 'Yes, for a different size of the same item.'],
    ],
  },
]
