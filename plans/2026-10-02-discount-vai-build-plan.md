# Discount Vai Build Plan

- **Date:** 2026-10-02
- **Status:** In development: all 8 milestones built, waiting for your review before merging to `main`
- **Related plans:** [Research and Site Plan](2026-10-02-discount-vai-website-research-and-site-plan.md) · [Claude Design Mockup Prompt](2026-10-02-claude-design-mockup-prompt.md)

## Goal
Turn the approved Claude Design mockups (Option D, in `design/claude-design-mockups/`) into a working website with an owner admin panel. "Done" for this plan: every page in the mockups works at 390 / 768 / 1440, the owner can manage everything from `/admin`, Cash on Delivery orders work end to end, and SSLCommerz is ready to switch on once merchant credentials exist.

## Stack (agreed in the site plan, §9)
| Part | Choice |
|---|---|
| Storefront | Next.js 16 (App Router, TypeScript, React 19) |
| Admin panel | Payload CMS 3, inside the same app at `/admin` |
| Database | PostgreSQL (local Postgres in development) |
| Images | Payload uploads (local folder in dev; S3/R2 storage adapter at launch) |
| Styling | One theme file of CSS-variable tokens (4 palette presets), wired into Tailwind; component styles ported from the mockups' `dv.css` / `site.css` |
| Fonts | Archivo (headings) + Hanken Grotesk (body) via `next/font`, set as tokens |
| Payments | Cash on Delivery (live) + SSLCommerz hosted checkout (sandbox, behind a switch) |

## Rules that shape the code
- **No framework branding anywhere:** no Next.js / Vercel / Payload logos, default SVGs or favicons; `X-Powered-By` header off; Next.js dev indicator off; admin panel shows the Discount Vai wordmark and title.
- Tokens only: components never hard-code colours, fonts or sizes. The palette is picked in the admin (Brand settings).
- Every hover has a tap equivalent; mobile-first; checked at 390 / 768 / 1440.
- No dead links: unfinished things lead to Coming Soon pages.
- Mockup annotations ("Lifestyle photo", "Hero 1 of 3 · desktop crop") are **not** shown on the real site. When the owner hasn't uploaded an image yet, a tinted, palette-aware placeholder is shown instead.

## Data model (Payload)
**Collections**
- `users`: admin logins, roles Owner / Staff.
- `media`: uploads, alt text required.
- `categories`: name, slug, parent, status (Live / Coming Soon / Hidden), menu group (Bottoms, Tops & Outerwear, Traditional), order, short label, intro + "read more" text, image, FAQs, SEO.
- `products`: name, slug, category, kicker ("Panjabi · Regular fit"), price, sale price, badges (New, Best seller), **colours** (name, hex, photos, sizes with stock per size), description, details (fabric, fit, care, SKU), size guide, SEO.
  - One product, many colours, stock per colour and size. Each colour is linkable (`/products/<slug>?colour=<name>`); canonical stays on the product URL.
- `size-guides`: name, unit rows (inches stored, cm calculated), how-to-measure text.
- `orders`: order number, access token, contact, address, zone, items snapshot, subtotal, delivery, discount, total, payment method (COD / online), payment status, order status, timeline, courier + tracking, SSLCommerz transaction fields.
- `subscribers`: email, source (popup, footer, women page, home teaser, checkout, coming soon), date; CSV export.
- `discount-codes`: code, % or fixed, minimum order, expiry, usage limit, times used, active.
- `reviews`: name, city, quote, product bought, photo, rating, featured.
- `pages`: About, Privacy, Terms, Returns & Exchange, Shipping & Delivery (rich text).
- `customers`: storefront accounts (log in, order history).
- `messages`: contact-form submissions.

**Globals**
- Brand settings: logo, favicon, palette preset.
- Header & footer: announcement messages, mega-menu featured tiles, footer promise, social links, WhatsApp number, contact details.
- Homepage: hero slides (desktop + mobile images), deal banner with end time, featured collection, best sellers, bags spotlight, women teaser on/off, trust strip, reviews heading, SEO text.
- Popup: on/off, image, all text, offer line, code, scroll %, delay, days hidden after closing.
- Delivery & payment: zone charges and times, free-delivery threshold, COD on/off and zones, advance delivery charge for COD, SSLCommerz on/off and sandbox mode.
- FAQ: groups of questions.

## Milestones (each one is its own branch and gets merged after you approve it)
1. **Foundation:** scaffold, theme tokens and fonts, Payload admin with Discount Vai branding, all collections and globals, seed with the dummy catalogue and generated placeholder photos.
2. **Global layout:** announcement bar, header (desktop, sticky, Men mega menu, Accessories dropdown), mobile/tablet drawer, footer, WhatsApp button, email popup with its frequency rules, Coming Soon system.
3. **Shopping pages:** home (all 12 sections), category listing (Men, subcategories, Bags, Sale, New Arrivals) with filters and sort, search overlay and results, product page (gallery, colours, sizes, size guide, toast, sticky add-to-cart).
4. **Cart and checkout:** cart drawer and page, checkout with zones and discount codes, Cash on Delivery orders, confirmation and payment-failed pages.
5. **Content and account:** About, FAQ, policies, Contact, Women Coming Soon, Style Guide Coming Soon, 404, customer login/register and order history.
6. **SEO:** titles and descriptions from templates (admin can override), JSON-LD (Organization, WebSite, BreadcrumbList, Product, ItemList, FAQPage), sitemap, robots, `noindex` on Coming Soon pages, redirects when slugs change.
7. **SSLCommerz:** sandbox integration (init, success / fail / cancel, IPN validation), behind the admin switch.
8. **QA and launch prep:** every page at 390 / 768 / 1440, Lighthouse, link check, deployment plan (hosting, Postgres, image storage, domain).

## Progress
Two branches, neither merged yet (the git rule: merge after you approve):
- `feature/foundation` (5 commits): milestone 1.
- `feature/storefront` (built on top of foundation, 29 more commits): milestones 2–8.

| Milestone | State |
|---|---|
| 1. Foundation | Done. Scaffold, branding off, all collections and settings, theme tokens, seed |
| 2. Global layout | Done. Announcement bar, header + mega menus, mobile/tablet drawer, footer, WhatsApp button, email pop-up with its frequency rules, Coming Soon pages |
| 3. Shopping pages | Done. Home (sections reorderable in the admin), Men / subcategories / Bags / Sale / New Arrivals with filters and sort, search overlay with suggestions and results page, product page (gallery, colours, sizes, size guide, sticky add-to-cart, recently viewed) |
| 4. Cart and checkout | Done. Cart drawer and page, checkout with districts/areas and zones, discount codes, Cash on Delivery orders (stock taken, code use counted), confirmation and payment-failed pages, **order emails** (confirmation to the customer, alert to the shop) |
| 5. Content and account | Done. About, FAQ, policies, Contact (saved to Messages), Track order, Size guide, Women + Style Guide Coming Soon, 404 / error pages, customer register / login / orders / addresses / profile / wishlist, **password reset by email** |
| 6. SEO | Done. Templated titles and descriptions (admin can override), keyword titles for every category, JSON-LD (OnlineStore, WebSite + search, BreadcrumbList, Product, ItemList, FAQPage), sitemap, robots, `noindex` on Coming Soon / account pages, redirects when a slug changes, `/favicon.ico` |
| 7. SSLCommerz | Built, not yet tested end to end. Init, success / fail / cancel / IPN with server-side validation, retry from the payment-failed page; switched off (shows "Soon") until credentials are in `.env` |
| 8. QA and launch prep | Done locally (see Verification). Deployment steps below; Lighthouse is to be run on the hosted site, where the numbers are real |

**Still placeholders (the owner fills these in the admin; the code doesn't change):**
- Products and photos: 35 dummy products with generated photos.
- Reviews: 3 sample reviews. They are made up, so they must be deleted or replaced before launch. The structure seed never creates them.
- Contact details: phone, WhatsApp, email and social links show `[…]` placeholders and are never turned into links.
- Courier name and real delivery charges: ৳70 / ৳130, free over ৳2,000.
- Pop-up offer line.
- Policy pages: About, Privacy, Terms, Returns & Exchange, Shipping & Delivery. Sample text only; the owner must check it.
- Homepage hero, deal and sale banner copy.
- Logo, favicon and brand colours: the "Discount Vai" text wordmark and DV monogram, with the Sage & Sand palette.

## Open questions
- Courier, real delivery charges and free-delivery threshold.
- Should COD orders pay the delivery charge in advance? (Admin switch, off by default.)
- Popup offer (placeholder line until decided).
- SSLCommerz merchant account (needs a trade licence) and which methods to show.
- Domain name and hosting (see Deployment).
- Email sending service for order emails (any SMTP: Gmail/Google Workspace, Zoho, Brevo, Amazon SES…).
- Phone, WhatsApp, email and social links.

## Deployment
**Recommended setup:** one small Linux server (VPS) in **Singapore**, the closest major region to Bangladesh. Give it 2 GB RAM or more, running Node.js 20+, PostgreSQL 17 and the site, behind Caddy or Nginx for HTTPS. Uploaded images stay on the server's disk (`media/`) and are backed up nightly with the database. Put Cloudflare (free plan) in front for DNS and caching.
- **Alternative (managed):** Railway or Render for the app plus their managed Postgres. Their disks are wiped on every deploy, so images must then go to object storage (Cloudflare R2 or S3) through `@payloadcms/storage-s3`. That package isn't installed yet: add it to `payload.config.ts` before launching this way.

**Production settings (`.env` on the server):**
- `DATABASE_URL`: the production database.
- `PAYLOAD_SECRET`: a new long random string, different from development.
- `NEXT_PUBLIC_SITE_URL=https://<domain>`. It is baked in when the site is built, so set it **before** `npm run build`. It feeds canonical URLs, the sitemap, JSON-LD, emails and SSLCommerz callbacks.
- `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_SANDBOX=false` (once live).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.
- `NODE_ENV=production`.
- No `SEED_*` values.

**First launch:**
1. Create an empty production database.
2. Run these on the server (keep the app running with pm2 or systemd):
   ```bash
   npm ci && npm run migrate && npm run build && npm run start
   ```
3. Run `npm run seed:structure` once. It loads categories (with their SEO text), size guides, pages and settings, and nothing else. It refuses to run if the database already has content.
4. Open `/admin`. On an empty database it asks you to create the first owner account.
5. In the admin, fill in every placeholder listed above. Add products, upload the logo and favicon, and set the delivery charges and order-email address.
6. In the SSLCommerz merchant panel, register the IPN URL `https://<domain>/payment/sslcommerz/ipn`. Place a sandbox order, then switch `SSLCOMMERZ_SANDBOX=false` and turn on "Offer online payment".
7. Add the site to Google Search Console and submit `https://<domain>/sitemap.xml`. Run Lighthouse and the Rich Results Test on the live pages.

**Every later deploy:**
```bash
git pull && npm ci && npm run migrate && npm run build
```
Then restart the app. When collections or settings fields change, run `npm run migrate:create <name>` in development and commit the new migration file.

**Never** run `npm run seed` on the live database. It wipes products, orders and subscribers, and it refuses unless forced.

## Verification
Checked on `feature/storefront` (2026-10-03):
- `npm run typecheck`, `npm run lint` and `npm run build` all pass.
- **Link check:** a crawl of 82 pages on the production build found no errors and no `#` links. A fresh-launch rehearsal (empty database → `migrate` → `seed:structure` → production server) gave 43 pages with no errors and no empty sections.
- **Migration:** on a new database it produces exactly the same tables and columns as development.
- **Layout:** checked in the browser at mobile, tablet and desktop: home, drawer, listing and filter sheet, product page, cart, checkout and account pages. No horizontal scroll.
- **COD order end to end:** stock went down, the sale was counted, the discount code use was counted, the order showed "Unpaid – COD", and both order emails were generated. User-entered text in emails is escaped.
- **Password reset:** the link works once, a bad or expired link shows a clear message, and mismatched passwords are caught.
- **Pop-up:** closing it keeps it hidden after a reload.
- **Access:** `/api/orders`, `/api/subscribers` and other private data return 403 without login.
- **Branding:** no `X-Powered-By` header and no framework branding on the site or in the admin.
- **Not yet verified:** SSLCommerz end to end (needs sandbox credentials), real email delivery (needs SMTP), and Lighthouse and Rich Results on the hosted site.
