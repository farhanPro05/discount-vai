# Stock Fixes and Code Audit

- **Date:** 2026-10-13
- **Status:** Done: built and tested, waiting for your review before merging to `main`
- **Related plans:** [Discount Vai Build Plan](2026-10-02-discount-vai-build-plan.md)

## Goal
Make stock reliable end to end, so the shop never sells what it doesn't have and always tells customers clearly when something is sold out. Then review the whole codebase and fix every problem found. Work happens on `feature/stock-fixes` (and a follow-up audit branch), merged into `main` after approval.

## Scope

### Part 1: stock fixes (found in the 2026-10-13 stock review)
1. **Orders on a product with an unpublished draft.** Taking or returning stock re-saved the product from its latest draft. That unpublished the product and put the draft's edits live (confirmed by test). Fix: update the live product and the pending draft separately.
2. **Online payments didn't hold stock**, and two checkouts for the last item could both succeed. Fix:
   - Reserve stock the moment an order is placed, with an atomic check, for both COD and online orders.
   - Release it when a payment fails, is cancelled or is abandoned (a job every 5 minutes).
   - If a payment arrives after the reservation lapsed and the stock has gone, flag the order for the shop.
3. **Product page gaps:**
   - "Try another colour" shows even when every colour is sold out.
   - The page opens on a sold-out colour when others are in stock.
   - Swatches don't show sold-out colours.
   - There's no "Sold out" near the title and price.
4. **Smaller gaps:**
   - Sold-out products are mixed into listings; they should go last.
   - The search dropdown doesn't mark sold-out items.
   - "Recently viewed" can show stale stock and prices.
   - Size + colour filters can match a sold-out combination.
   - Adding the same size twice can push the cart above stock.
   - The admin gives no warning that stock changes on its own.

### Part 2: code audit
A review of the rest of the codebase. Each finding is listed below with its fix. Already noted while doing Part 1:
- "Retry payment" can start a new payment for an order that is already paid or cancelled.
- "Switch to Cash on Delivery" skips the advance-delivery-charge rule and re-takes stock without checking it.

## Implementation notes
- Stock changes go through `src/lib/stock.ts`, inside one in-process lock, so checks and updates can't interleave. That needs a **single app instance**, which matches the VPS deployment in the build plan; pm2 must run in fork mode, not cluster.
- `stockCommitted` on an order now means "this order currently holds stock".
- Order emails and discount-code counting happen when an order is **confirmed**: COD placed, or online/advance payment validated.

## Progress
**Part 1: done** (branch `feature/stock-fixes`)

| Item | Commit |
|---|---|
| 1. Draft-safe stock updates | `254daa5` (with item 2) |
| 2. Reserve at checkout, release on failed/abandoned payment, flag late payments, cancel/return/delete/re-open | `254daa5` |
| Retry payment / Switch to COD checks | `254daa5` |
| Online payment "Coming soon" everywhere; COD only (user request) | `f17c2e1` |
| 3. Product page sold-out display | `9156ca8` |
| 4a + 4d. Sold-out last in listings; filters by real stock; admin stock warning | `fdeba12` |
| 4b, 4c, 4e. Search marks sold out; recently viewed refreshed; cart capped at stock | `f806524` |

Tested on the local database:
- A 23-step stock test: simultaneous checkouts, pending drafts, COD order with a code, cancel twice, stale admin form, re-open (with and without stock), abandoned payment, retry, double release.
- In the browser: product page states, cart cap, recently viewed refresh, search, filters, and sold-out sorting.

**Part 2: code audit: done** (branch `feature/code-audit`, stacked on `feature/stock-fixes`)

| # | Finding | Severity | Commit |
|---|---|---|---|
| 1 | Login `?next=` accepted `//evil.com` (open redirect after login) | High | `a6c4a03` |
| 2 | No security headers; uploaded SVGs could run scripts; no upload size limit | Medium | `7f708b7` |
| 3 | Customers could read "Staff notes (private)" of their own orders through the API | Medium | `61d66e6` |
| 4 | Forged SSLCommerz fail/cancel posts could mark orders failed and free their stock; weak transaction IDs | High | `3293df3` |
| 5 | Payment details hidden for COD orders that paid delivery in advance | Low | `6c863de` |
| 6 | Invoice pages not excluded in robots.txt | Low | `d700c1a` |
| 7 | Scheduled (status-only) publishes rebuilt a product's custom slug from its name | Medium | `6134b3e` |
| 8 | Renaming a product in a draft and publishing later created no redirect (old links 404) | Medium | `c085a94` |
| 9 | Simultaneous checkouts could pick the same order number; the second failed | Medium | `332702f` |
| 10 | No rate limits: contact/sign-up flooding, code/order-number guessing, fake orders draining stock | High | `546274f` |
| 11 | Payload accepted admin cookies from any origin (CSRF allowlist empty) | Medium | `3de227c` |
| 12 | `?sort=constructor` passed the sort check | Low | `439722d` |
| 13 | A damaged saved cart (`{}`) or pop-up setting (`null`) would break every page | Medium | `225a632` |
| 14 | Categories/pages could take addresses that can never be reached; 3-level or looping categories | Medium | `5636431` |
| 15 | Pressing Enter twice placed two orders; any address could pick the cheaper Inside Dhaka delivery | High | `9d23acc` |
| 16 | Customer sign-up / login / reset on Payload's REST API skipped the site's checks and limits | High | `590fd1d` |
| 17 | Any customer account could list and download staff's order and subscriber exports | **Critical** | `dc28656` |
| 18 | Customer tokens could write to Payload's built-in collections (document locks) | Medium | `00f1c2e` |
| 19 | Payment callback redirected to the request's (possibly internal) address | High (at deploy) | `47e0f43` |
| 20 | Cart page kept a stale discount after quantities changed | Medium | `363d24f` |
| 21 | Deleting a shipped/delivered order added its items back to stock | Medium | `ef60c23` |
| 22 | A colour could be saved with no sizes (unbuyable) | Low | `7a36e1d` |
| 23 | Deleting the latest order made its number reusable | Medium | `61335d4` |

Checked and found sound (no change needed):
- Access rules for every collection and global, staff-to-owner escalation, and login lockout (5 attempts).
- JSON-LD escaping, email escaping, the order-page ownership check, and the hero slider (pauses, respects reduced motion).

Added `npm run check:shop` (`d31c262`), which runs 20 stock and order checks against the local database and restores everything.

**Final verification (2026-10-14):**
- Type check, lint and production build pass.
- All migrations apply in order to a new database, and the result matches the dev schema (columns, indexes, enums). The structure seed and the full seed both pass the new rules.
- `check:shop`: 20/20.
- Crawl: 82 pages, no errors, no `#` links. Missing pages return 404.
- Lighthouse (mobile, real throttling): Accessibility, Best Practices and SEO 100; Performance 89–98; LCP about 2 s.
