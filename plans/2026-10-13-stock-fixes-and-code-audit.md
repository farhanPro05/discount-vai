# Stock Fixes and Code Audit

- **Date:** 2026-10-13
- **Status:** In development
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
(updated as each item is committed)
