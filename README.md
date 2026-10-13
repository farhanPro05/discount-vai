# Discount Vai

Online store for Discount Vai, a Bangladeshi men's clothing brand, with an owner admin panel at `/admin`.

- **Storefront:** Next.js 16 (App Router, React 19, TypeScript)
- **Admin panel and data:** Payload CMS 3, inside the same app
- **Database:** PostgreSQL
- **Payments:** Cash on Delivery, plus SSLCommerz (switched off until merchant credentials exist)

Project rules (plans, responsive design, git, no framework branding, design tokens) are in [`CLAUDE.md`](CLAUDE.md). Plans are in [`plans/`](plans/README.md).

## Run it on your computer

You need Node.js 20.9 or newer and PostgreSQL (17 is used in development).

1. Install packages:

   ```bash
   npm install
   ```

2. Copy the settings file, then open `.env` and fill it in. It holds the database address, a long random `PAYLOAD_SECRET`, and the admin login the seed creates (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

   ```bash
   cp .env.example .env
   ```

3. Create the database:

   ```bash
   createdb discount_vai
   ```

4. Fill it with the dummy catalogue (35 products with placeholder photos, categories, pages, settings, a demo customer and a test code). The seed **deletes** products, orders and subscribers first, and refuses to run against anything that looks like a live database.

   ```bash
   npm run seed
   ```

5. Start the site:

   ```bash
   npm run dev
   ```

   - Website: <http://localhost:3000>
   - Admin panel: <http://localhost:3000/admin>. Log in with the admin email and password from your `.env`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with live reload |
| `npm run build` / `npm run start` | Production build, then serve it |
| `npm run lint` / `npm run typecheck` | Code checks |
| `npm run seed` | Reset the local database to the dummy catalogue (refuses live databases) |
| `npm run seed:structure` | Load only categories, size guides, pages and settings into an empty database (for a new live shop) |
| `npm run check:shop` | Check the stock and order rules against the local database (places, cancels and deletes test orders, then restores everything) |
| `npm run migrate` | Apply database migrations (production) |
| `npm run migrate:create <name>` | Record a migration after changing collections or settings fields |
| `npm run generate:types` | Refresh `src/payload-types.ts` after changing collections |

## Where things are

| Path | What's there |
|---|---|
| `src/app/(frontend)/(site)` | Storefront pages (home, categories, product, cart, account, info pages) |
| `src/app/(frontend)/checkout` | Checkout, with its own minimal header |
| `src/app/(frontend)/actions.ts` | Server actions (cart pricing, orders, sign-up, account) |
| `src/app/(print)` | Printable staff pages (order invoice), opened from the admin |
| `src/collections`, `src/globals` | Everything the admin panel manages |
| `src/components` | UI, grouped by area (layout, shop, product, listing, home, content, account) |
| `src/lib` | Data access, pricing and orders, SEO, emails, SSLCommerz |
| `src/styles/tokens.css` | **Design tokens.** Every colour, font, size, radius and shadow. Edit here to restyle the site |
| `src/seed` | Dummy catalogue and generated placeholder photos |
| `src/migrations` | Database migrations for production |
| `design/claude-design-mockups` | The approved Claude Design mockups (the visual spec) |

## Changing the look

- **Palette:** in the admin, Settings → Brand settings. Pick one of four presets (Sage & Sand, Harbour, Clay & Stone, Olive & Ivory); it applies across the whole site.
- **Logo and favicon:** upload them in the same place. Until then the site uses the "Discount Vai" text wordmark and the DV monogram.
- **Anything else** (fonts, spacing, radius, the colours of a preset): `src/styles/tokens.css`. Components never hard-code these values.

## Going live

See the deployment section of the [build plan](plans/2026-10-02-discount-vai-build-plan.md#deployment).
