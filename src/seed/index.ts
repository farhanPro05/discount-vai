/**
 * Development seed: fills the database with the dummy catalogue and copy from the
 * approved mockups. Run with `npm run seed`. It REPLACES all catalogue, content,
 * order and subscriber data (admin users are kept). Never run it against production.
 */
import 'dotenv/config'

import { randomBytes } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import config from '../payload.config'
import {
  BEST_SELLERS,
  CATALOGUE,
  CATEGORY_FOR_SHAPE,
  FAQ_GROUPS,
  FEATURED,
  HEX_NAMES,
  MEN_FAQS,
  NEW_ARRIVALS,
  PANJABI_FAQS,
  SIZE_GUIDES,
  TYPE_COPY,
  type SeedProduct,
} from './data'
import { monogramSvg, placeholderPhoto } from './images'
import { doc, p, ul } from './lexical'
import { HOME_SECTIONS } from '../globals/homeSections'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(dirname, '../../public')

const WIPE = [
  'orders',
  'products',
  'categories',
  'size-guides',
  'reviews',
  'pages',
  'subscribers',
  'discount-codes',
  'messages',
  'customers',
  'redirects',
  'media',
] as const

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function sizesFor(z?: string): string[] {
  if (z === '28–40') return ['28', '30', '32', '34', '36', '38', '40']
  if (z === 'M–XXL') return ['M', 'L', 'XL', 'XXL']
  if (z === 'One size') return ['One size']
  return ['S', 'M', 'L', 'XL', 'XXL']
}

async function uploadPhoto(payload: Payload, product: SeedProduct, colour: { name: string; hex: string }, shot: 0 | 1 | 2) {
  const views = ['front view', 'back view', 'close-up detail']
  const buffer = await placeholderPhoto(product.k, colour.hex, shot)
  const name = `${product.n}-${colour.name}-${shot + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const created = await payload.create({
    collection: 'media',
    data: { alt: `${product.n} in ${colour.name}, ${views[shot]}` },
    file: { data: buffer, mimetype: 'image/webp', name: `${name}.webp`, size: buffer.length },
  })
  return created.id
}

async function writeIcons() {
  const svg = monogramSvg()
  await fs.mkdir(publicDir, { recursive: true })
  await fs.writeFile(path.join(publicDir, 'favicon.svg'), svg)
  await sharp(Buffer.from(svg)).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'))
  await sharp(Buffer.from(svg)).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'))
  await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'))
  await fs.writeFile(path.join(publicDir, 'favicon-dv.ico'), await icoFromSvg(svg))
}

/** A .ico holding 16, 32 and 48px PNGs (served at /favicon.ico until a favicon is uploaded in the admin). */
async function icoFromSvg(svg: string): Promise<Buffer> {
  const sizes = [16, 32, 48]
  const pngs = await Promise.all(sizes.map((s) => sharp(Buffer.from(svg), { density: 384 }).resize(s, s).png().toBuffer()))
  const header = Buffer.alloc(6)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(sizes.length, 4)
  let offset = 6 + 16 * sizes.length
  const entries = sizes.map((s, i) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(s, 0)
    e.writeUInt8(s, 1)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(pngs[i].length, 8)
    e.writeUInt32LE(offset, 12)
    offset += pngs[i].length
    return e
  })
  return Buffer.concat([header, ...entries, ...pngs])
}

/** The Sunday at least a week from now, 23:59 Bangladesh time. */
function nextSundayNight(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 7 + ((7 - d.getUTCDay()) % 7))
  d.setUTCHours(17, 59, 0, 0) // 23:59 at UTC+6
  return d.toISOString()
}

/**
 * SEED_ONLY=structure (npm run seed:structure) loads only what a live shop starts from: categories with
 * their SEO text, size guides, pages and settings. No dummy products, reviews, codes or orders, and it never
 * deletes anything, so it's the one to run once on a new, empty production database.
 */
const STRUCTURE_ONLY = process.env.SEED_ONLY === 'structure'

/** The full seed deletes products, orders and subscribers, so it refuses to touch a live database unless forced. */
function guardLiveDatabase() {
  if (STRUCTURE_ONLY || process.env.SEED_FORCE === 'true') return
  const host = (() => {
    try {
      return new URL(process.env.DATABASE_URL || '').hostname
    } catch {
      return ''
    }
  })()
  const local = ['localhost', '127.0.0.1', '::1', ''].includes(host)
  if (process.env.NODE_ENV === 'production' || !local) {
    throw new Error(
      `Refusing to seed: it wipes products, orders and subscribers, and this looks like a live database (${host || 'production'}). Set SEED_FORCE=true to run it anyway.`,
    )
  }
}

async function run() {
  guardLiveDatabase()
  const payload = await getPayload({ config })
  const log = (m: string) => payload.logger.info(`[seed] ${m}`)

  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!STRUCTURE_ONLY && (!adminEmail || !adminPassword)) throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env first.')

  if (STRUCTURE_ONLY) {
    for (const collection of ['categories', 'products', 'pages'] as const) {
      const { totalDocs } = await payload.count({ collection, overrideAccess: true })
      if (totalDocs) throw new Error(`The database already has ${collection}; the structure seed only runs on an empty database.`)
    }
  } else {
    log('Clearing old seed data')
    for (const collection of WIPE) {
      await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true })
    }
  }

  // With no admin in .env (structure seed), /admin asks for the first owner account instead.
  if (adminEmail && adminPassword) {
    log('Admin user')
    const admins = await payload.find({ collection: 'users', where: { email: { equals: adminEmail } }, limit: 1 })
    if (!admins.docs[0]) {
      await payload.create({ collection: 'users', data: { email: adminEmail, password: adminPassword, name: 'Shop owner', role: 'owner' } })
    }
  }

  log('Icons')
  await writeIcons()

  log('Size guides')
  const guideIds: Record<string, number> = {}
  for (const g of SIZE_GUIDES) {
    const created = await payload.create({
      collection: 'size-guides',
      data: {
        name: g.name,
        columns: g.columns,
        rows: g.rows.map(([size, values]) => ({ size, values })),
        howToMeasure: g.howToMeasure.map(([label, text]) => ({ label, text })),
        tip: g.tip,
      },
    })
    guideIds[g.name] = created.id
  }

  log('Categories')
  const cat = async (data: Record<string, unknown>) => (await payload.create({ collection: 'categories', data: data as never })).id
  const men = await cat({
    name: 'Men',
    slug: 'men',
    order: 1,
    heading: "Men's Clothing",
    intro: 'Everyday trousers, shorts, tees, jerseys, jackets and Panjabi, made to last and priced fairly.',
    introMore: 'New styles land every week, every order ships across Bangladesh, and every size comes with a 7-day exchange.',
    faqTitle: 'Shopping men’s clothing: FAQ',
    faqs: MEN_FAQS.map(([question, answer]) => ({ question, answer })),
    shape: 'panjabi',
  })
  await cat({
    name: 'Women',
    slug: 'women',
    order: 2,
    status: 'soon',
    shape: 'tote',
    soonHeading: "Women's collection is coming soon",
    soonText: 'Easy kurtis, wide-leg trousers and everyday tops, at the same fair prices. Be the first to know when it lands.',
  })
  const acc = await cat({
    name: 'Accessories',
    slug: 'accessories',
    order: 3,
    heading: 'Accessories',
    intro: 'Bags for everyone, built to carry a lot.',
    shape: 'backpack',
  })
  const subs: [string, string, string, string, string, Record<string, unknown>?][] = [
    ['Trousers', 'trousers', 'bottoms', 'trouser', 'Chinos and twills'],
    ['Shorts', 'shorts', 'bottoms', 'shorts', 'Cotton and linen'],
    ['3/4 Pants', '3-4-pants', 'bottoms', 'three4', 'Cargo and jogger'],
    ['2/4 Pants', 'half-pants', 'bottoms', 'half', 'Half pants'],
    ['Club Jerseys', 'club-jerseys', 'tops', 'jersey', '25/26 season'],
    ['Jackets', 'jackets', 'tops', 'jacket', 'Bombers and denim'],
    ['Drop T-Shirts', 'drop-shoulder-t-shirts', 'tops', 'tee', 'Oversized fits', { heading: 'Drop-Shoulder T-Shirts' }],
    [
      'Panjabi',
      'panjabi',
      'traditional',
      'panjabi',
      'Festive and everyday',
      {
        intro: 'Festive and everyday Panjabi in cotton, linen and jacquard.',
        introMore: ' Regular fits that run true to size, with an easy 7-day exchange if it is not quite right.',
        faqTitle: 'Panjabi: FAQ',
        faqs: PANJABI_FAQS.map(([question, answer]) => ({ question, answer })),
      },
    ],
  ]
  const SEO: Record<string, { title: string; description: string }> = {
    trousers: { title: "Men's Trousers & Chinos Online in Bangladesh", description: "Shop men's chinos and twill trousers at fair prices. Waist 28 to 40, Cash on Delivery across Bangladesh and easy 7-day exchange." },
    shorts: { title: "Men's Shorts Online in Bangladesh", description: 'Cotton and linen-blend shorts for men, S to XXL. Cash on Delivery across Bangladesh and easy 7-day exchange.' },
    '3-4-pants': { title: '3/4 Pants for Men in BD: Cargo & Jogger', description: 'Cargo and jogger 3/4 pants for men at fair prices. Cash on Delivery across Bangladesh and easy 7-day exchange.' },
    'half-pants': { title: 'Half Pants for Men (2/4 Pants) in Bangladesh', description: "Shop men's half pants (2/4 pants) in soft cotton, S to XXL. Cash on Delivery across Bangladesh and easy 7-day exchange." },
    'club-jerseys': { title: '25/26 Club Jerseys Price in Bangladesh', description: 'Lightweight, quick-dry 25/26 club jerseys at fair prices. Cash on Delivery across Bangladesh and easy 7-day exchange.' },
    jackets: { title: 'Jackets for Men in Bangladesh: Bomber & Denim', description: "Men's bomber and denim jackets at fair prices. Cash on Delivery across Bangladesh and easy 7-day exchange." },
    'drop-shoulder-t-shirts': { title: 'Drop Shoulder T-Shirts for Men in Bangladesh', description: 'Oversized drop-shoulder tees in heavy cotton, S to XXL. Cash on Delivery across Bangladesh and easy 7-day exchange.' },
    panjabi: { title: "Men's Panjabi in Bangladesh: Cotton & Festive", description: 'Shop cotton, linen and festive Panjabi for Eid and every day. Panjabi price from ৳1,850, Cash on Delivery across Bangladesh.' },
  }
  const catIds: Record<string, number> = {}
  for (const [i, [name, slug, menuGroup, shape, tileText, extra]] of subs.entries()) {
    catIds[slug] = await cat({
      name,
      slug,
      parent: men,
      order: i + 1,
      menuGroup,
      shape,
      tileText,
      intro: `Shop men's ${name.toLowerCase()} at fair prices, with Cash on Delivery across Bangladesh.`,
      seo: SEO[slug],
      ...extra,
    })
  }
  catIds.bags = await cat({
    name: 'Bags (Unisex)',
    slug: 'bags',
    parent: acc,
    order: 1,
    shape: 'backpack',
    tileText: 'Totes, backpacks, slings',
    heading: 'Bags (Unisex)',
    seo: { title: 'Unisex Bags in BD: Totes, Backpacks & Slings', description: 'Tough canvas totes, backpacks, sling and duffel bags for everyone, from ৳650. Cash on Delivery across Bangladesh.' },
    intro: 'Totes, backpacks, slings and duffels for everyone.',
    introMore: ' One size, tough canvas and padded straps, built to carry a lot.',
  })

  if (!STRUCTURE_ONLY) log('Products and photos (this takes a minute)')
  const productIds: Record<number, number> = {}
  // Older products first, then new arrivals from oldest to newest, so "Newest" sorting matches the mockups.
  const order = [
    ...CATALOGUE.filter((p) => !NEW_ARRIVALS.includes(p.id)),
    ...[...NEW_ARRIVALS].reverse().map((id) => CATALOGUE.find((p) => p.id === id) as SeedProduct),
  ]
  for (const product of STRUCTURE_ONLY ? [] : order) {
    const copy = TYPE_COPY[product.k]
    const r = rng(product.id * 97)
    const names = new Set<string>()
    const colours = [{ name: product.c, hex: product.f }]
    names.add(product.c)
    for (const hex of product.sw) {
      if (hex.toUpperCase() === product.f.toUpperCase()) continue
      let name = HEX_NAMES[hex.toUpperCase()] ?? HEX_NAMES[hex] ?? 'Other'
      while (names.has(name)) name += ' II'
      names.add(name)
      colours.push({ name, hex })
    }
    const sizeList = sizesFor(product.z)
    const colourRows = []
    for (const [ci, colour] of colours.entries()) {
      const shots: (0 | 1 | 2)[] = ci === 0 ? [0, 1, 2] : [0, 1]
      const images = []
      for (const shot of shots) images.push(await uploadPhoto(payload, product, colour, shot))
      const sizes = sizeList.map((size) => {
        let stock = Math.floor(r() * 12) + 1
        if (product.out) stock = 0
        if (product.id === 15 && ci === 0 && size === 'XL') stock = 0
        if (product.id === 15 && ci === 0 && size === 'M') stock = 3
        return { size, stock }
      })
      colourRows.push({ name: colour.name, hex: colour.hex, images, sizes })
    }
    const isPanjabi15 = product.id === 15
    const created = await payload.create({
      collection: 'products',
      draft: false,
      data: {
        _status: 'published',
        name: product.n,
        category: catIds[CATEGORY_FOR_SHAPE[product.k]],
        kicker: `${copy.type} · ${copy.fit.split(',')[0]}`,
        price: product.p,
        salePrice: product.s ?? null,
        isNew: !!product.nw,
        isBestSeller: BEST_SELLERS.includes(product.id),
        shape: product.k,
        colours: colourRows,
        description: isPanjabi15
          ? 'A clean, everyday Panjabi in soft combed cotton that breathes through long Eid days. Mandarin collar, hidden placket and side pockets. Pairs with white pajama or your favourite chinos.'
          : copy.blurb,
        details: {
          fabric: isPanjabi15 ? '100% combed cotton, 140 GSM' : copy.fabric,
          fit: copy.fit,
          care: copy.care,
          sku: `DV-${copy.code}-${String(product.id).padStart(4, '0')}-${product.c.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase()}`,
        },
        sizeGuide: copy.guide ? guideIds[copy.guide] : null,
        salesCount: BEST_SELLERS.includes(product.id) ? 400 - BEST_SELLERS.indexOf(product.id) * 30 : Math.floor(r() * 120),
      },
    })
    productIds[product.id] = created.id
  }

  // Sample reviews are only for local testing: never publish made-up reviews on the live shop.
  if (!STRUCTURE_ONLY) log('Reviews')
  const reviews = STRUCTURE_ONLY ? [] : [
    ['Rafi', 'Dhaka', 'Ordered the white Panjabi for Eid. Fabric is soft, stitching is neat and it arrived in a day.', 'Classic Cotton Panjabi', 'panjabi'],
    ['Arif', 'Chattogram', 'Exchanged a size with zero hassle. The chinos fit better than brands twice the price.', 'Slim Fit Cotton Chino', 'trouser'],
    ['Nayeem', 'Sylhet', 'Paid cash on delivery, got a call to confirm first. The backpack has survived a month of commuting.', 'Urban Backpack', 'backpack'],
  ]
  for (const [i, [name, city, quote, productName, shape]] of reviews.entries()) {
    await payload.create({
      collection: 'reviews',
      data: { name, city, quote, productName, rating: 5, featured: true, order: i + 1, shape: shape as never },
    })
  }

  log('Pages')
  await payload.create({
    collection: 'pages',
    data: {
      title: 'About Discount Vai',
      slug: 'about',
      navLabel: 'About us',
      navOrder: 1,
      lead: 'We started Discount Vai with one simple idea: good clothes should not cost a fortune, and buying them should feel like getting advice from your brother.',
      layout: [
        { blockType: 'image' },
        {
          blockType: 'text',
          heading: 'What we make',
          body: doc(p("Everyday menswear and unisex bags: trousers, shorts, 3/4 and half pants, drop-shoulder tees, club jerseys, jackets and Panjabi. A women's line is on the way.")) as never,
        },
        {
          blockType: 'cards',
          style: 'values',
          items: [
            { title: 'Fair prices', text: 'We keep margins honest and pass the savings on. No fake "was" prices.' },
            { title: 'Quality checked', text: 'Every piece is checked for stitching, colour and size before it ships.' },
            { title: 'Here to help', text: 'Real people on WhatsApp and phone, every day from 9 am to 10 pm.' },
          ],
        },
        {
          blockType: 'text',
          heading: 'How we work',
          body: doc(
            p("We sell online only, so we can skip rent and pass that on to you. Order with Cash on Delivery anywhere in Bangladesh (online payment is coming soon), and exchange within 7 days if it isn't right."),
          ) as never,
        },
      ],
    },
  })
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Shipping & Delivery',
      slug: 'shipping-delivery',
      navOrder: 3,
      lead: 'We deliver everywhere in Bangladesh. Here is how long it takes and what it costs.',
      layout: [
        {
          blockType: 'cards',
          style: 'facts',
          items: [
            { title: '৳70', text: 'inside Dhaka, 1 to 2 days' },
            { title: '৳130', text: 'outside Dhaka, 2 to 4 days' },
            { title: 'Free', text: 'on orders over ৳2,000' },
          ],
        },
        {
          blockType: 'text',
          heading: 'Before we ship',
          body: doc(p('We call or SMS to confirm every order before it ships, usually within 2 hours between 9 am and 10 pm.')) as never,
        },
        {
          blockType: 'text',
          heading: 'Tracking your order',
          body: doc(p('When your order ships we send an SMS with the courier name and tracking ID. You can also see it under Account → My orders.')) as never,
        },
        {
          blockType: 'text',
          heading: 'Festive seasons',
          body: doc(p('Around Eid, deliveries can take a day longer. Order at least 4 days before Eid outside Dhaka and 2 days inside Dhaka.')) as never,
        },
      ],
    },
  })
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Returns & Exchange',
      slug: 'returns-exchange',
      navOrder: 4,
      lead: 'Wrong size or not quite right? Exchange it within 7 days of delivery. No drama.',
      layout: [
        {
          blockType: 'cards',
          style: 'facts',
          items: [
            { title: '7 days', text: 'to request an exchange' },
            { title: 'Free pickup', text: 'inside Dhaka, ৳70 outside' },
            { title: 'Refunds', text: 'to bKash or Nagad in 5 to 7 days' },
          ],
        },
        {
          blockType: 'steps',
          heading: 'How to exchange',
          items: [
            { bold: 'Message us', text: 'on WhatsApp or the Contact page with your order number.' },
            { bold: 'Pick a new size or item.', text: 'We hold it for you.' },
            { bold: 'Hand over the item', text: 'to our rider, unworn with tags on.' },
            { bold: 'Get the new one', text: 'in the same trip or within 2 days.' },
          ],
        },
        {
          blockType: 'text',
          heading: 'What can be exchanged',
          body: doc(p('Unworn items with original tags and packaging. Sale items can be exchanged for a different size.')) as never,
        },
        { blockType: 'text', heading: "What can't", body: doc(p('Items that have been worn, washed or altered, and innerwear for hygiene reasons.')) as never },
        {
          blockType: 'text',
          heading: 'Refunds',
          body: doc(p("If we can't swap it, we refund you to bKash or Nagad within 5 to 7 days.")) as never,
        },
      ],
    },
  })
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      navLabel: 'Privacy',
      navOrder: 6,
      lead: '[Placeholder] This page explains what information Discount Vai collects and how it is used. Replace this text with your final policy before launch.',
      layout: [
        {
          blockType: 'text',
          heading: 'What we collect',
          body: doc(p('To deliver your order we need your name, phone number and address. If you give us your email, we use it for receipts and delivery updates.'), ul(['Order details and delivery address', 'Phone number and, optionally, email', 'Emails you sign up with for the Vai List'])) as never,
        },
        {
          blockType: 'text',
          heading: 'How we use it',
          body: doc(p('Only to process and deliver your orders, answer your messages, and, if you opted in, send you news about new drops and deals. We never sell your data.')) as never,
        },
        {
          blockType: 'text',
          heading: 'Your choices',
          body: doc(p('You can unsubscribe from emails at any time with the link at the bottom of every email, or ask us to delete your account by messaging us.')) as never,
        },
      ],
    },
  })
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Terms & Conditions',
      slug: 'terms',
      navLabel: 'Terms',
      navOrder: 7,
      lead: '[Placeholder] The terms for shopping with Discount Vai. Replace this text with your final terms before launch.',
      layout: [
        {
          blockType: 'text',
          heading: 'Orders',
          body: doc(p('An order is confirmed once we have called or messaged you to confirm it. Prices are in Bangladeshi Taka and include VAT where applicable.')) as never,
        },
        {
          blockType: 'text',
          heading: 'Payment',
          body: doc(p('Every order is Cash on Delivery: please check your items before paying the rider. Online payment (bKash, Nagad and cards) is coming soon.')) as never,
        },
        { blockType: 'text', heading: 'Exchanges', body: doc(p('See our Returns & Exchange page for the full exchange policy.')) as never },
      ],
    },
  })

  log('Globals')
  await payload.updateGlobal({ slug: 'brand', data: { palette: 'sage' } })
  await payload.updateGlobal({
    slug: 'site',
    data: {
      announcements: [
        { text: 'Free delivery on orders over ৳2,000' },
        { text: 'Easy 7-day exchange, no questions' },
        { text: 'Cash on Delivery across Bangladesh' },
      ],
      menFeature: { eyebrow: 'The Eid edit', title: 'Panjabi from ৳1,850', linkLabel: 'Shop now', link: '/men/panjabi' },
      accessoriesFeature: { eyebrow: 'Carry more', title: 'Bags from ৳650', linkLabel: 'Shop now', link: '/accessories/bags' },
      promise: "Good clothes, fair prices, honest service. That's the Vai promise.",
      newsletterLabel: 'New drops and members-only deals, straight to your inbox',
      phone: '[01XXX-XXXXXX]',
      whatsapp: '',
      email: '',
      hours: 'Every day, 9 am to 10 pm',
      showWhatsAppButton: true,
    },
  })
  await payload.updateGlobal({
    slug: 'home',
    data: {
      sections: HOME_SECTIONS.map((s) => ({ section: s.value })),
      slides: [
        { eyebrow: 'The Eid edit', heading: 'Eid, sorted.', text: 'Festive and everyday Panjabi in breathable cotton. From ৳1,850.', ctaLabel: 'Shop Panjabi', ctaLink: '/men/panjabi' },
        { eyebrow: 'New drop', heading: 'Easy summer shorts.', text: 'Cotton and linen-blend shorts, half pants and 3/4s. From ৳590.', ctaLabel: 'Shop shorts', ctaLink: '/men/shorts' },
        { eyebrow: 'Vai’s Deals', heading: 'Up to 25% off bestsellers.', text: 'Jackets, chinos and backpacks at their lowest prices this season.', ctaLabel: 'Shop the sale', ctaLink: '/sale' },
      ],
      categoriesHeading: 'Shop by Category',
      newArrivals: { heading: 'New Arrivals', count: 8 },
      bestSellers: { heading: "Vai's Best Sellers", products: BEST_SELLERS.map((id) => productIds[id]).filter(Boolean) },
      deal: {
        eyebrow: 'Ends Sunday, 11:59 pm',
        heading: "Vai's Deals of the Week",
        text: "Up to 25% off bestsellers. When they're gone, they're gone.",
        endsAt: nextSundayNight(),
        ctaLabel: 'Shop the deals',
        ctaLink: '/sale',
      },
      featured: {
        heading: 'Panjabi for Eid',
        link: '/men/panjabi',
        linkLabel: 'Shop the collection',
        eyebrow: 'Featured collection',
        title: 'Dressed for Eid',
        text: 'From ৳1,850. Free delivery over ৳2,000.',
        products: FEATURED.map((id) => productIds[id]).filter(Boolean),
      },
      bags: {
        eyebrow: 'Bags · Unisex',
        heading: 'Carry more, pay less.',
        text: 'Totes, backpacks and slings built for rickshaw rides and long commutes. Tough canvas, honest prices, from ৳650.',
        chips: [
          { label: 'Totes', link: '/accessories/bags?q=tote' },
          { label: 'Backpacks', link: '/accessories/bags?q=backpack' },
          { label: 'Slings', link: '/accessories/bags?q=sling' },
        ],
        ctaLabel: 'Shop bags',
        ctaLink: '/accessories/bags',
      },
      womenTeaser: {
        pill: 'Coming soon',
        heading: "Women's collection is on the way",
        text: 'Same fair prices, same easy exchange. Be the first to know when it lands.',
        linkLabel: 'Take a sneak peek',
        link: '/women',
      },
      trust: [
        { icon: 'exchange', title: 'Easy exchange', subtitle: '7 days, no fuss' },
        { icon: 'truck', title: 'Delivery across Bangladesh', subtitle: '1 to 4 days' },
        { icon: 'wallet', title: 'Cash on Delivery', subtitle: 'pay when it arrives' },
        { icon: 'shirt', title: 'Quality fabrics', subtitle: 'checked before they ship' },
      ],
      reviews: { heading: 'What our customers say', ratingText: '' },
      seo: {
        heading: 'About Discount Vai',
        text: "Discount Vai is a Bangladeshi online clothing shop for men, with unisex bags and a women's line on the way. We make everyday trousers, shorts, drop-shoulder tees, club jerseys, jackets and Panjabi in breathable fabrics, and sell them at prices that make sense.",
        more: 'Order online with Cash on Delivery anywhere in Bangladesh. Delivery inside Dhaka takes 1 to 2 days and outside Dhaka 2 to 4 days. If the size is not right, exchange it within 7 days. Think of us as your brother in the business: honest about quality, fair on price.',
      },
    },
  })
  await payload.updateGlobal({
    slug: 'popup',
    data: {
      enabled: true,
      eyebrow: 'The Vai List',
      heading: 'Join the Vai List',
      text: 'New drops, members-only deals and early access. One email a week, tops.',
      offer: '',
      buttonLabel: 'Join the Vai List',
      benefitsHeading: 'Be the first to know',
      benefits: [
        { icon: 'bell', label: 'New drops' },
        { icon: 'tag', label: 'Members-only deals' },
        { icon: 'zap', label: 'Early access' },
      ],
      successHeading: "You're on the list!",
      successText: "Welcome to the family, vai. We'll email you about new drops and members-only deals.",
      code: '',
      scrollPercent: 70,
      delaySeconds: 8,
      hideDays: 7,
    },
  })
  await payload.updateGlobal({
    slug: 'commerce',
    data: {
      inside: { fee: 70, eta: '1 to 2 days' },
      outside: { fee: 130, eta: '2 to 4 days' },
      freeDeliveryOver: 2000,
      exchangeDays: 7,
      codEnabled: true,
      codZones: ['inside', 'outside'],
      codAdvanceDelivery: false,
      onlineEnabled: false,
      onlineLabels: 'bKash, Nagad, Visa, Mastercard',
      nextSteps: { call: 'Within 2 hours, between 9 am and 10 pm.', ship: 'Same or next day. The courier contacts you before delivering.' },
    },
  })
  await payload.updateGlobal({
    slug: 'faq',
    data: {
      lead: 'Quick answers on orders, delivery and exchanges.',
      groups: FAQ_GROUPS.map((g) => ({ title: g.title, questions: g.questions.map(([question, answer]) => ({ question, answer })) })),
    },
  })

  if (STRUCTURE_ONLY) {
    log('Done (structure only: add products, then check every page, setting and placeholder in the admin)')
    process.exit(0)
  }

  log('Discount code')
  await payload.create({ collection: 'discount-codes', data: { code: 'VAI10', type: 'percent', value: 10, active: true } })

  log('Demo customer and orders')
  const demoPassword = process.env.SEED_DEMO_PASSWORD
  if (demoPassword) {
    const customer = await payload.create({
      collection: 'customers',
      data: {
        name: 'Rafi Ahmed',
        username: '01712345678',
        email: 'rafi.demo@example.com',
        password: demoPassword,
        addresses: [{ label: 'Home', district: 'Dhaka', area: 'Dhanmondi', line: 'House 12, Road 5' }],
      },
    })
    const demo = [
      { items: [[10, 'Sky Blue', 'L'], [13, 'Off-White', 'M']], status: 'shipped', days: 0 },
      { items: [[15, 'White', 'M']], status: 'delivered', days: 18 },
      { items: [[1, 'Khaki', '32'], [3, 'Navy', 'M'], [7, 'Grey Melange', 'L']], status: 'delivered', days: 41 },
      { items: [[19, 'Black', 'One size']], status: 'cancelled', days: 64 },
    ] as const
    for (const [i, o] of demo.entries()) {
      const items = o.items.map(([id, colour, size]) => {
        const sp = CATALOGUE.find((x) => x.id === id) as SeedProduct
        const unit = sp.s ?? sp.p
        return { product: productIds[id], name: sp.n, colour, size, qty: 1, unitPrice: unit, originalPrice: sp.p, lineTotal: unit }
      })
      const subtotal = items.reduce((s, x) => s + x.lineTotal, 0)
      const delivery = subtotal >= 2000 ? 0 : 70
      await payload.create({
        collection: 'orders',
        context: { seed: true },
        data: {
          createdAt: new Date(Date.now() - o.days * 86_400_000).toISOString(),
          orderNumber: `DV-${24817 - i * 413}`,
          accessToken: randomBytes(16).toString('hex'),
          status: o.status,
          paymentMethod: 'cod',
          paymentStatus: o.status === 'delivered' ? 'paid' : 'unpaid_cod',
          customer: customer.id,
          contact: { name: 'Rafi Ahmed', phone: '01712345678', email: 'rafi.demo@example.com' },
          address: { district: 'Dhaka', area: 'Dhanmondi', line: 'House 12, Road 5' },
          zone: 'inside',
          items,
          subtotal,
          delivery,
          discount: 0,
          total: subtotal + delivery,
          staffNotes: 'Demo order from the seed data.',
          shipping: o.status === 'shipped' ? { courier: '[Courier name]', trackingId: '[TRACKING-ID]' } : {},
        },
      })
    }
  }

  log('Done')
  process.exit(0)
}

// `payload run` imports this file and exits as soon as the import resolves, so wait here.
try {
  await run()
} catch (err) {
  console.error(err)
  process.exit(1)
}
