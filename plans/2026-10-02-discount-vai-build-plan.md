# Discount Vai Build Plan

- **Date:** 2026-10-02
- **Status:** In development
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

## Open questions
- Courier, real delivery charges and free-delivery threshold (placeholders: ৳70 / ৳130 / ৳2,000).
- Should COD orders pay the delivery charge in advance? (Admin switch, off by default.)
- Popup offer (placeholder line until decided).
- SSLCommerz merchant account (needs a trade licence), domain, hosting.
- Phone, WhatsApp, email and social links (placeholders in square brackets until provided).

## Verification
- `npm run build` passes with no type errors.
- Browser check of every page at 390 / 768 / 1440 (no horizontal scroll, tap targets ≥ 44px).
- Admin: create a product with two colours, it appears on the site; set a category to Coming Soon, it shows the SOON pill and the Coming Soon page.
- Place a COD order end to end; it appears in the admin as "Unpaid – COD".
- Popup: close it, reload, it stays hidden.
- No Next.js / Payload / Vercel branding visible on the site, in the admin, in favicons, or in response headers.
