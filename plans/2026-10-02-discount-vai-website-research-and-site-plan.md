# Discount Vai Website: Research and Site Plan

- **Date:** 2026-10-02
- **Status:** Approved (in design)
- **Related plans:** none yet (first plan)
- **Saved as (on approval):** `plans/2026-10-02-discount-vai-website-research-and-site-plan.md`

---

## Context

Discount Vai is a Bangladeshi clothing (textile) brand that needs its own e-commerce website. The owner must be able to run everything from an **admin panel**: products, images, names, descriptions, prices, categories, homepage banners and orders. The user gave three reference sites: **Le Reve** (BD fashion), **RaveBD** (BD footwear) and **Rebecca Atwood** (US textiles). This plan has two jobs:

1. Record what those sites do well and badly.
2. Turn that into a site plan detailed enough for the user to make **Claude Design mockups** from it.

No website code is written until the user says to start building.

**Steps when this plan is approved.** These are housekeeping only, no website code:
1. Save this plan as `plans/2026-10-02-discount-vai-website-research-and-site-plan.md` and add it to `plans/README.md`.
2. Fix the brand spelling **"Discount Bhai" → "Discount Vai"** in `CLAUDE.md` and `plans/README.md`.
3. Add the two permanent rules below (**Responsive design** and **Git workflow**) to `CLAUDE.md` so every future session follows them.
4. Run `git init` in the project, add a `.gitignore` (`node_modules`, `.env*`, `.next`, `.DS_Store`), and make the first commit: `docs: add project rules and research & site plan`.

---

## 1. Permanent rules (they apply to every plan, mockup and line of code)

### 1.1 Responsive design: desktop, tablet and mobile
| Device | Width range | Mockup frame |
|---|---|---|
| Mobile | 360–767px | **390px** |
| Tablet | 768–1023px | **768px** |
| Desktop | 1024px+ (content max-width ~1360px, centred on wider screens) | **1440px** |

- **Every page and component is designed in Claude Design at all three sizes**, and every build is checked at all three sizes before it counts as done.
- Build mobile-first. No horizontal scrolling at any width.
- Tap targets are at least 44×44px, and body text is at least 16px on mobile.
- **Pinch-zoom stays allowed.** (RaveBD blocks it, which is an accessibility failure.)
- Anything that works on hover (mega menu, second product image) needs a tap equivalent on touch screens.
- Tablet and mobile use the drawer menu. Desktop uses the full header with mega menu.
- The admin can upload **separate desktop and mobile banner images**, so banner text never gets cropped on phones (RaveBD does this well).

### 1.2 Git workflow (use git for everything)
- The project is a git repo from day one. **Each logical change is its own commit.** Never bundle unrelated changes.
- Commit message format: `type(area): what changed`, plus a line explaining *why* when it isn't obvious.
  - Types: `feat`, `fix`, `style`, `content`, `seo`, `refactor`, `docs`, `chore`.
  - Example: `feat(header): add Men mega menu with featured image`
- `main` is always the working, approved version. Each task gets its own branch (`feature/header-mega-menu`), which is merged into `main` once the user approves it.
- Milestones get tags (`v0.1-homepage`, `v0.2-catalog`, `v1.0-launch`).
- **When the user reports a problem** ("this looks wrong", "this broke"), go to git first: `git log` on the affected files, then `git diff`, `git blame`, and `git bisect` if needed. That finds the commit that caused it without re-reading the whole codebase. Report the commit hash, its message and what changed, then fix it in a **new** commit. Never rewrite history.
- Plans and docs are committed too. Secrets (SSLCommerz keys, DB passwords) live only in `.env` and are never committed.

### 1.3 Other standing rules
- **No dead links.** Nothing on the site is unclickable or points to `#`. Anything not ready yet shows **"Coming Soon"** (see §5.3).
- **The owner can edit everything.** Text, images, banners, menu items, popup copy and SEO fields all come from the admin panel. Nothing the owner might want to change is hard-coded.
- **Built for SEO** (see §8). Every page ships with proper titles, descriptions, headings, alt text and structured data.
- **Styling can be changed at any time.** Brand colours, logo and fonts aren't decided yet and may change after launch, so:
  - Every colour, font, type size, spacing value, corner radius and shadow is a **design token**, defined once in a single theme file (CSS variables, wired into Tailwind).
  - Components **never hard-code** a colour, font or size; they only use tokens. Changing the palette or fonts means editing one file, not hunting through components.
  - The logo and favicon are uploaded in the admin, never baked into code.
  - The approved palettes from Claude Design are saved as ready-made theme presets, so switching between them is a one-line change.

---

## 2. Research findings

### 2.1 At a glance
| | **Le Reve** (lerevecraze.com) | **RaveBD** (ravebd.com) | **Rebecca Atwood** (rebeccaatwood.com) |
|---|---|---|---|
| What they sell | BD fashion & lifestyle (men, women, teen, kids, home) | BD women's designer footwear | US designer fabric, wallpaper, pillows |
| Platform | Next.js frontend + headless WordPress/WooCommerce | WordPress + WooCommerce + WPBakery, Rank Math SEO | Shopify (custom theme) |
| Look and feel | Bold commercial, yellow accents, full-screen campaign imagery | Clean white, pink brand colour, product-first | Editorial/premium, lots of white space, serif + monospace type |
| Best idea to borrow | Mega menu and the email popup design | Trust strip, customer-photo reviews, mobile drawer | Non-blocking newsletter, editorial polish, SEO content |
| Main weakness | Popup spam, SKU-code URLs, broken structured data | Dead `#` menu links, no homepage H1, zoom disabled | Missing image alt text |

### 2.2 Le Reve: closest match (BD clothing brand)
- **Header:** yellow announcement bar with the current offer; logo on the left; nav in the centre (`Sale` in a red outlined box, then Puja, Fall, Women, Men, Teen, Kids, Nargisus, Home Decor); account, search, cart count and country flag on the right.
- **Mega menu (on hover):** a lifestyle photo on the left, then four columns of grouped subcategories under bold headings (Shirt, Panjabi, T-shirts & Polos, Bottom Wear, Footwear, Accessories…). → **We use this layout for "Men".**
- **Email popup:** a split modal.
  - Left half: brand photo, "BE THE FIRST TO KNOW", and three benefit icons (New collections / Exclusive offers / Special rewards).
  - Right half: mail icon, headline "Never Miss a New Collection", one line of copy, email field, big yellow **Unlock Access** button, and a "No spam" reassurance line.
  - → **We borrow this design.**
- **Popup problems to avoid:**
  - It shows up again on **every page load**, even after you close it.
  - A second promo-image popup stacks on top of it.
  - A browser push-notification prompt and a chat bubble appear at the same moment.
  - That's four interruptions at once.
- **Homepage:** full-screen scroll-snap sections, each a campaign photo with a "Shop This Style" button.
- **Category page:** a minimal filter bar (Color / Price / Sort by); a 4-column grid on desktop and 2 columns on mobile; each card swipes through several photos (with indicator bars) and shows name and price.
- **Product page:**
  - Breadcrumb, two-up photo gallery, name, price, SKU.
  - Size selector with a **Size Chart** link; **Add to cart**.
  - "Colour may vary" note and a **free-shipping threshold** note.
  - **Accordions:** Product Info, and Product Details (Colour / Size / Fabric / Fit).
  - **Similar Products** underneath.
- **SEO:**
  - ✅ Good category titles ("Men's Fashion – Your Desired Men's Clothing Collection | Le Reve"), and one H1 per page.
  - ❌ Product URLs are SKU codes (`/product/mlcs15511/`), so they carry no keywords.
  - ❌ Structured data is stuffed into a `<meta>` tag instead of a JSON-LD script, so Google can't read it, and there's no Product price/stock markup.
  - ❌ Product images have no alt text.

### 2.3 RaveBD: strongest BD SEO setup and trust signals
- **Header:**
  - Logo on the left.
  - Nav: Footwear ▾ / Collections ▾ / Sale / Store Location / Contact / Founder's Message.
  - Right side: Login/Register, search, wishlist count, and a cart showing its total ("Tk. 0").
  - Underneath, a thin **scrolling trust strip**: "Easy return and refund | Hassle free exchange".
- **Homepage:**
  - Hero banner, with **different art for mobile**.
  - Three category tiles with label buttons.
  - "New Arrivals" grid in 4 columns: colour-swatch dots, "Name | Colour", price.
  - **"Reviews From Our Customers" carousel** of real customer photos with 5 stars and short quotes.
  - Exchange-policy banner, social icons, and a minimal footer of policy links.
- **Product page:**
  - Large gallery; H1 "Pearl Detailed Slide Block Heel | White"; price; style number; one-line description.
  - **Colour swatches are photo thumbnails, and each colour is its own page/URL.**
  - Size buttons (36–41), quantity stepper, Add to cart, wishlist, Size Guide.
  - Description as a **labelled fact list**: Upper material / Lining / Sole / Heel type / Care.
- **Mobile:** "☰ MENU" with the logo centred and the cart on the right. The slide-out drawer has **search at the top**, sub-menus that expand with "›", then Wishlist and Login.
- **SEO:**
  - ✅ Readable keyword URLs (`/shop/pearl-detailed-slide-block-heel-white/`).
  - ✅ Product/ProductGroup and Breadcrumb JSON-LD, canonical tags, full robots directives.
  - ❌ **No H1 on the homepage.**
  - ❌ Product pages reuse the generic site meta description.
  - ❌ Empty image alt text.
  - ❌ **"Footwear" and "Collections" link to `#`**, which is exactly the dead-click problem we're avoiding.
  - ❌ Pinch-zoom is disabled, and product images load slowly.

### 2.4 Rebecca Atwood: premium polish and content-led SEO
- **Look:**
  - Editorial, with a full-bleed lifestyle **video** hero and generous white space.
  - Elegant serif headings with the colour name in italic ("Prism Stripe Fabric *in Multi Clay/Green*"), paired with small uppercase monospace UI text.
- **Header:**
  - Text links rather than icons: Fabric / Wallpaper / Inspiration on the left, logo in the centre, Search / Trade / Log in / Cart on the right.
  - The **mega menu** has four parts:
    - a quick column (All / New In / Best Sellers / Sale / Gifts)
    - "By Type" and "By Collection" columns
    - a "Get Started" help column (Usage, FAQ, How to order)
    - a **large featured image with a tagline and Shop Now**.
- **Newsletter:** a **small slide-in card at the bottom-left** (email field and Sign Up) that never blocks shopping. On mobile it becomes a full-width bottom card. The cookie notice sits underneath it.
- **Homepage:**
  - Video hero, collection carousel, then a split of two big tiles (Wallpapers / Textiles).
  - Product carousels for each collection.
  - A "Resources" row (FAQ, calculator, process).
  - **Blog section ("Into the Fold")**, brand values, and a press quote (Vogue).
  - Footer with the newsletter signup.
- **Product page:**
  - Vertical thumbnail strip with a large main image.
  - Price, a short story-style description, and **round colour swatches** linking to the other colourways.
  - Stock/lead time, quantity, a black Add to Cart button, and a sample upsell.
  - Descriptor tags ("SHIFTING, ABSTRACT, RICH") and a detailed spec section.
- **SEO:**
  - ✅ **Hand-written, keyword-rich meta descriptions** per product ("Buy Rebecca Atwood's woven Prism Stripe Fabric… Upholstery fabric available by the yard…").
  - ✅ Clean `/products/…` URLs, and a blog bringing in long-tail search traffic.
  - ❌ Image alt text missing.

### 2.5 What this means for Discount Vai
| Lesson | Decision |
|---|---|
| Mega menus with grouped columns and a featured photo look premium and are easy to scan | Use the Le Reve/Rebecca Atwood mega menu for Men and Accessories |
| Le Reve's popup design converts but its behaviour annoys people | Copy the **design**, but trigger it on scroll depth, show it **once**, remember when it's closed, never stack popups |
| Dead `#` links (RaveBD) frustrate users and waste crawl budget | Every item links somewhere; unfinished ones go to a **Coming Soon** page |
| Trust signals sell in BD (RaveBD) | Trust strip, customer-photo reviews, clear exchange and delivery info |
| Keyword URLs and real JSON-LD (RaveBD) beat SKU URLs and broken markup (Le Reve) | Keyword slugs and proper JSON-LD on every page |
| All three skip image alt text | **Alt text is required in the admin** (auto-filled from the product name) |
| A content blog drives SEO (Rebecca Atwood) | Plan a "Style Guide" blog for phase 2; build the structure now |
| Separate mobile banners (RaveBD) | Banners need both a desktop and a mobile image |
| Structured product facts (RaveBD, Le Reve) | Product details as labelled facts: Fabric, Fit, Care… |

---

## 3. Decisions so far

| Topic | Decision |
|---|---|
| Brand name | **Discount Vai** (spelled "Vai", not "Bhai") |
| Platform | **Custom-coded Next.js website with a built-in admin panel** at `/admin` |
| Payments | **Cash on Delivery** and **online payment through SSLCommerz** (one gateway covering mobile wallets like bKash/Nagad, plus cards). The exact SSLCommerz methods are still to be decided. |
| Language | **English at launch**, structured so **Bangla can be added later** without a redesign |
| Popup offer | **Decide later.** All popup text and the offer are editable in the admin. |
| Categories at launch | MEN (8 subcategories) and ACCESSORIES (Bags, unisex). **WOMEN = Coming Soon.** |
| "2/4 Pants" | Means **half pants**. The menu label stays "2/4 Pants"; the URL and SEO text use "half pants", the phrase people search for. |
| "Drop T-Shirts" | Means **drop-shoulder T-shirts**. The menu label stays "Drop T-Shirts"; the URL and SEO text use "drop shoulder". |

---

## 4. Site map and URLs (keyword-friendly)

| Page | URL | Notes |
|---|---|---|
| Home | `/` | |
| Men (all) | `/men` | Landing page with subcategory chips and all men's products |
| Trousers | `/men/trousers` | |
| Shorts | `/men/shorts` | |
| 3/4 Pants | `/men/3-4-pants` | |
| 2/4 Pants | `/men/half-pants` | 2/4 pants = half pants. The URL uses the searched phrase. |
| Club Jerseys | `/men/club-jerseys` | |
| Jackets | `/men/jackets` | |
| Drop T-Shirts | `/men/drop-shoulder-t-shirts` | Drop T-shirts = drop-shoulder T-shirts. The URL uses the searched phrase. |
| Panjabi | `/men/panjabi` | |
| Accessories | `/accessories` | |
| Bags (Unisex) | `/accessories/bags` | |
| Women | `/women` | **Coming Soon** page with "Notify me" |
| New Arrivals | `/new-arrivals` | Automatic: the newest products |
| Sale / Deals | `/sale` | Automatic: products with a sale price. Fits the "Discount" brand. |
| Product | `/products/{name-colour}` | e.g. `/products/black-cotton-drop-shoulder-t-shirt` |
| Search | `/search?q=` | |
| Cart / Checkout / Order done | `/cart`, `/checkout`, `/order/{id}` | |
| Account | `/account` (orders, addresses) | Optional. Guest checkout is allowed. |
| Info pages | `/about`, `/contact`, `/faq`, `/size-guide`, `/shipping-delivery`, `/returns-exchange`, `/privacy-policy`, `/terms` | Owner edits these in the admin |
| Style Guide (blog) | `/style-guide` | Phase 2. Shows "Coming Soon" until then. |
| 404 | n/a | Friendly page with search and category links |

---

## 5. Page-by-page breakdown (for mockups)

### 5.1 Header
**Desktop (1024px+)**
1. **Announcement bar** (admin-editable, 1–3 rotating messages, can be switched off), e.g. "Free delivery on orders over ৳X • Easy exchange".
2. **Main bar:**
   - Logo on the left.
   - Nav in the centre: **MEN ▾ · WOMEN `SOON` · ACCESSORIES ▾ · NEW ARRIVALS · SALE**.
   - Right side: Search 🔍, Account 👤, Cart 🛍 with item count.
3. **Men mega menu** (opens on hover; also on click/tap):
   - Column "Bottoms": Trousers, Shorts, 3/4 Pants, 2/4 Pants.
   - Column "Tops & Outerwear": Drop T-Shirts, Club Jerseys, Jackets.
   - Column "Traditional": Panjabi.
   - Column "Quick links": Shop All Men, New In, Sale.
   - **Featured image tile** (admin-set photo, tagline and "Shop now" link).
   - *These groupings are a suggestion; the owner's list is flat. The admin controls the menu order.*
4. **Accessories dropdown:** Bags (Unisex), Shop All Accessories, and a featured image.
5. **WOMEN:** carries a small "SOON" pill so customers know before they click. Clicking it opens the Women Coming Soon page.
6. **Sticky header:** once the user scrolls, the announcement bar hides and the main bar sticks to the top in a slimmer version.

**Tablet and mobile (under 1024px)**
- Bar: ☰ menu on the left, logo in the centre, search and cart on the right.
- **Slide-out drawer**, from top to bottom:
  - Search field.
  - Men ›, which expands to show all 8 subcategories and Shop All.
  - Women `SOON`.
  - Accessories ›.
  - New Arrivals, then Sale.
  - Divider.
  - Account, Track Order, Help & Contact.
  - Social icons.

### 5.2 Email capture popup ("Join the Vai list")
- **Desktop/tablet:** a centred split modal in the Le Reve style.
  - Left: brand photo, a big "Be the first to know" headline, and 3 benefit icons.
  - Right: headline, short text, **offer line (decided later)**, email field, big CTA button, and "No spam, unsubscribe anytime" with a Privacy link.
- **Mobile:** a **bottom sheet** that slides up and covers about 60% of the screen, with the photo as a slim strip on top. It has a large ✕ button and closes when you tap outside it. It never covers the whole screen (that avoids Google's mobile pop-up penalty).
- **When it appears:**
  - It shows when the visitor scrolls about **70% down the page or reaches the footer** (what the user described). On desktop it also shows when the mouse moves to leave the page.
  - It never shows in the first 8 seconds, and never on cart or checkout.
- **How often:**
  - At most once per visit.
  - If the visitor closes it, it stays hidden for **7 days**.
  - It **never shows again** after they subscribe.
  - It is never stacked with another popup or a push-notification prompt.
- **States to design:** default, error (invalid email), loading, and success ("You're on the list!", plus a discount code if the owner adds an offer).
- **Admin controls:** on/off, image, headline, text, offer text, button label, scroll %, days to hide.
- **Signups also come from** the footer newsletter form, the Women "Notify me" form, and an opt-in checkbox at checkout. All of them go into **one Subscribers list** tagged with the source, which can be exported to CSV.

### 5.3 "Coming Soon" system
- In the admin, **any category or page can be set to Live / Coming Soon / Hidden**.
- **Coming Soon** items stay in the menu with a "SOON" pill and link to a branded **Coming Soon page**. That page shows the category name, a short teaser line, a **"Notify me when it launches" email field** (another source of emails), and links to shop Men and Accessories in the meantime.
- These pages are **not indexed by Google** until they go live, so they don't count against us as thin content.
- At launch: **Women**, and **Style Guide** (blog). The owner can add more (e.g. Kids) at any time without code.

### 5.4 Homepage (top to bottom; the admin can reorder sections or switch them off)
1. **Header**, with the announcement bar.
2. **Hero slider:** 1–5 slides, each with a desktop image and a mobile image, headline, sub-text and button.
3. **Shop by Category:** 9 image tiles (8 Men subcategories plus Bags). 4 per row on desktop, 3 on tablet, a 2-column grid (or a swipeable row) on mobile.
4. **New Arrivals:** a product carousel or grid, with a "View all" button.
5. **Deal banner:** an admin-set promo ("Deals of the week", "Eid offer"), which can include a countdown.
6. **Featured collection:** admin-picked, e.g. "Panjabi for Eid" or "Club Jerseys", as a large lifestyle image with 4 products.
7. **Best Sellers** carousel.
8. **Bags spotlight:** a split image/text block linking to the Bags category.
9. **Women's teaser:** "Women's collection coming soon. Get notified" (can be switched off).
10. **Trust strip:** Easy exchange · Delivery across Bangladesh · Cash on Delivery & secure online payment · Quality fabrics.
11. **Customer reviews:** customer photos, stars and short quotes, managed in the admin.
12. **SEO text block:** a short, readable "About Discount Vai: affordable men's clothing online in Bangladesh…" with the page's H1 or H2 keywords.
13. **Footer.**

### 5.5 Category page (e.g. Men, Panjabi)
- Breadcrumb, then the **H1** (e.g. "Men's Panjabi"), then a short intro (admin-written, SEO) with "Read more".
- **Men landing only:** subcategory chips under the title (Trousers · Shorts · …).
- **Filters:** Size, Colour, Price range. **Sort:** Newest, Price low→high, Price high→low, Best selling.
  - Desktop: a filter bar above the grid, with dropdowns.
  - Mobile: "Filter" and "Sort" buttons that open bottom sheets.
- **Product grid:** 4 columns on desktop, 3 on tablet, 2 on mobile.
- **Product card:**
  - Photo; on desktop the 2nd photo shows on hover, on mobile you can swipe.
  - Badges: `NEW`, `-20%`, `SOLD OUT`.
  - Name, then the **sale price with the original price struck through** (this is where the "discount" shows).
  - Colour dots.
- "Load more" button, with crawlable numbered pages behind it for SEO.
- Empty state when no products match: suggest clearing filters.
- Optional **FAQ block** at the bottom (good for SEO), e.g. "How do I choose my trouser size?"

### 5.6 Product page
- Breadcrumb.
- **Gallery:**
  - Desktop: vertical thumbnails plus a large image, with click-to-zoom.
  - Mobile: a swipe carousel with dots and full-screen pinch-zoom.
- **Name (H1)** and price, plus the compare-at price and "You save ৳X" when on sale.
- **Colour swatches:** each colour has its own URL, which is good for SEO.
- **Size buttons:** out-of-stock sizes are greyed out and crossed through. "Size Guide" opens a modal with that category's chart.
- Stock hint ("Only 3 left").
- Quantity, then **Add to Cart** (primary) and Buy Now. **On mobile, a sticky Add-to-Cart bar** stays at the bottom.
- Delivery info line: inside Dhaka vs outside Dhaka charges and times, taken from admin settings. Then the exchange-policy line.
- **Accordions:**
  - Description.
  - Details as labelled facts: Fabric, Fit, Care, SKU.
  - Delivery & Exchange.
- Share buttons: Facebook, WhatsApp, Copy link.
- "You may also like" (same category), then "Recently viewed".
- *Phase 2:* customer reviews on product pages.

### 5.7 Cart and checkout
- **Cart drawer** slides in when something is added: items, quantity, subtotal, "Checkout" and "View cart". There's also a full `/cart` page.
- **Checkout** is a single page. **Guest checkout is allowed**, and creating an account is optional.
  1. Contact: **phone (required)**, email (optional, recommended).
  2. Delivery address: name, district/city, area, full address. Then the delivery zone (inside/outside Dhaka), which sets the shipping cost.
  3. Order notes, and a discount code field.
  4. Payment, with two choices shown as large selectable cards:
     - **Cash on Delivery**: the customer pays the courier on delivery. The order is placed right away.
     - **Pay online (SSLCommerz)**: bKash, Nagad, cards and so on. It redirects to SSLCommerz's secure page and back.
     - The admin can switch COD off, limit it to certain delivery zones, or ask for the delivery charge in advance on COD orders (a common way to cut fake orders in BD).
  5. A newsletter opt-in checkbox.
- **Order confirmation page** with an order number, summary and next steps. A confirmation email is sent (and an SMS later, if wanted).
- Payment-failed and payment-cancelled pages, each with a retry button.

### 5.8 Search
- Search overlay (desktop) or full screen (mobile) with **live suggestions**: matching products with thumbnails, plus matching categories.
- Results page in the same grid as category pages, and a "no results" state with popular categories.

### 5.9 Footer
- Logo with a one-line brand promise.
- Columns:
  - **Shop:** Men, Accessories, Women (Soon), New Arrivals, Sale.
  - **Help:** Contact, FAQ, Size Guide, Shipping & Delivery, Returns & Exchange, Track Order.
  - **Company:** About, Style Guide (Soon), Privacy, Terms.
- Newsletter signup form.
- Social links: Facebook, Instagram, TikTok, WhatsApp. These are admin-set, and any that are blank are hidden.
- Payment-methods banner ("Cash on Delivery" plus the SSLCommerz methods), then "© Discount Vai".
- **Floating chat button** (WhatsApp or Messenger link, admin-set). Optional.

### 5.10 Other screens to design
Women Coming Soon page · Info page template (About, FAQ, policies) · Size guide modal · 404 · Account (login/register, orders) · Loading skeletons · Toast messages ("Added to cart").

---

## 6. Admin panel: what the owner can manage
| Area | What the owner can do |
|---|---|
| **Products** | Name, auto slug (editable), short and full description, category, **multiple images** (drag to reorder, alt text auto-filled), colours, sizes, **stock per size/colour**, price, sale price, SKU, fabric, fit, care, tags, badges (New / Best seller), featured toggle, status (Draft / Published / Scheduled), SEO fields (title, description, share image) with a Google preview |
| **Categories** | Name, slug, parent, image, intro text, SEO fields, menu order, **status: Live / Coming Soon / Hidden** |
| **Homepage** | Hero slides (desktop and mobile images), section order and on/off, featured collection, deal banner, customer reviews |
| **Header and footer** | Announcement messages, mega-menu featured images, footer links, social links, chat button |
| **Popup** | On/off, image, all text, offer, trigger %, days to hide |
| **Subscribers** | List with email, date and source; **export CSV** |
| **Orders** | List and search; status (Pending → Confirmed → Shipped → Delivered / Cancelled / Returned); payment method (COD or online); payment status (online: from SSLCommerz; COD: "Unpaid – COD" until marked paid on delivery); customer details; print invoice |
| **Customers** | Accounts and order history |
| **Discount codes** | % or fixed amount, expiry, usage limit, minimum order |
| **Delivery settings** | Zones (inside/outside Dhaka), charges, free-delivery threshold, delivery times |
| **Payment settings** | Cash on Delivery on/off, which zones allow COD, optional advance delivery charge for COD; SSLCommerz on/off and sandbox/live mode |
| **Pages** | About, FAQ, policies and size guides (rich text editor) |
| **Media library** | All uploaded images |
| **Users and roles** | Owner (everything), Staff (products and orders only) |
| **Brand settings** | Upload the logo and favicon; pick the site palette from the approved presets |

The admin panel must also work well **on a phone**, so the owner can add products and handle orders from anywhere.

---

## 7. Design direction (brief for Claude Design)
- **Personality:** friendly, value-focused and confident. "Vai" (brother) gives a warm, bro-to-bro tone in copy ("Vai's Picks", "Vai's Deals"). The polish should still feel trustworthy and premium-casual: Le Reve's clean commerce layout, Rebecca Atwood's white space, RaveBD's trust signals.
- **Logo:** none exists yet. Until there is one, mockups use a simple **text wordmark "Discount Vai"** in the heading font, sized to fit the logo slot in the header and footer. That way a real logo can drop in later without changing any layouts.
- **Colour:** brand colours are **not decided yet**; the user will choose them. Claude Design researches and proposes **4 test palettes**.
  - **Not flashy:** no bright or pure red, no bright yellow, no neon.
  - Soft/pastel or balanced mid-tone colours that simply look good. Pastels go on backgrounds and surfaces; deeper shades go on text and buttons, so everything passes WCAG AA contrast.
  - Sale prices, badges and buttons must still stand out, using a deeper or warmer shade from the palette rather than loud red.
  - Each palette suits menswear now and womenswear later.
  - The prototype has a **palette switcher** so every page can be previewed in each option.
  - The full brief is in [`2026-10-02-claude-design-mockup-prompt.md`](2026-10-02-claude-design-mockup-prompt.md).
- **Type:** a strong sans-serif for headings and a clean sans-serif for body text. Choose fonts that sit well next to a **Bangla font** added later (e.g. Hind Siliguri or Noto Sans Bengali).
- **Photography:** all product photos use the **same aspect ratio (4:5)** on a clean, consistent background, with lifestyle shots for banners. The admin will show upload guidance.
- **Components to design** (each at 390, 768 and 1440):
  - Headers: desktop, sticky, and mobile with the drawer open.
  - Mega menu.
  - "SOON" pill.
  - Popup: modal, bottom sheet, and the success state.
  - Product card: default, sale, new, and sold-out states.
  - Filter/sort: desktop bar and mobile sheet.
  - Product page gallery and the sticky add-to-cart bar.
  - Size guide modal.
  - Cart drawer.
  - Checkout steps.
  - Footer.
  - Toasts, skeleton loaders, empty states.
- **Mockup checklist (pages):** Home · Men landing · Subcategory (Panjabi) · Product · Women Coming Soon · Search · Cart · Checkout · Order confirmation · Info page · 404.

---

## 8. SEO plan
**Technical**
- Pages are rendered on the server (Next.js), so Google sees the full content.
- Target fast loading: LCP under 2.5s on a mobile 4G connection.
- Images are converted automatically to WebP/AVIF in responsive sizes, and lazy-load below the fold.
- Clean keyword URLs and a canonical tag on every page.
- The **XML sitemap updates automatically**, and robots.txt is in place.
- **When the owner changes a slug, a 301 redirect is created automatically.**
- One H1 per page, a proper heading order, semantic HTML.
- No `#` links; Coming Soon pages are `noindex`.
- HTTPS, a real 404 page, and pinch-zoom allowed.

**Structured data (real JSON-LD scripts, not Le Reve's meta-tag mistake)**
- Organization and WebSite (with the site search box).
- BreadcrumbList.
- **Product** (price in BDT, availability, brand, images, SKU).
- ItemList on category pages, FAQPage on the FAQ page.

**On-page**
- Every page gets an automatic title and description from a template, which the admin can override.
  - Example title: `Men's Panjabi Online in Bangladesh | Discount Vai`.
  - Example description: `Shop men's panjabi at Discount Vai. Cotton & festive panjabi at the best price with delivery across Bangladesh.`
- **Alt text is required on images.**
- Category intro text, internal links (related products, breadcrumbs), and Open Graph/Twitter cards so **Facebook and WhatsApp shares show the product image and price**. This matters a lot, because BD shopping runs on Facebook.

**Starting keyword targets** (to be checked later in Google Search Console and Keyword Planner)
- `men's trousers in Bangladesh` · `panjabi price in Bangladesh` · `drop shoulder t-shirt BD` · `club jersey price in Bangladesh` · `3/4 pant for men` · `half pant for men BD` · `men's shorts online BD` · `jacket for men in Bangladesh` · `unisex bag BD` · `online clothing shop Bangladesh` · `discount clothing BD` · brand `Discount Vai` (plus the "discount bhai" and "discountvai" spellings, used naturally on the About page).
- Phase 2: Bangla keywords (পাঞ্জাবি, জার্সি…) once the Bangla version is added (with `hreflang` tags), plus Style Guide blog posts for long-tail searches ("how to style a panjabi for Eid").

**Measurement:** set up Google Search Console and Google Analytics 4 at launch. Meta Pixel is optional (see Open questions).

---

## 9. Technical direction (details go in a separate build plan after the mockups)
- **Next.js (TypeScript)** storefront, with **Payload CMS** as the admin panel. Payload lives inside the same Next.js app at `/admin`, is free and open-source, and handles image uploads, drafts/scheduling, user roles and a phone-friendly admin.
- PostgreSQL database; image storage on object storage (e.g. Cloudflare R2 or S3).
- Tailwind CSS for styling, driven by **design tokens** (CSS variables in one theme file) so colours, fonts and spacing can be changed at will (see §1.3).
- **Cash on Delivery** orders are created directly. **SSLCommerz** uses its hosted checkout with server-side payment verification (IPN).
- Bangla-ready from the start: all text lives in the CMS or a translation file, and the routes allow `/bn/...` later.
- Everything is tracked in git (§1.2) from the first file.

---

## 10. Open questions (for the user and the owner)
1. ~~**"2/4 Pants"**: what does it mean?~~ **Answered:** half pants.
2. ~~**"Drop T-Shirts"**: is that drop-shoulder T-shirts?~~ **Answered:** yes.
3. ~~Is there a **logo and brand colours** already?~~ **Answered:** not yet. The user will decide the brand colours, and mockups use a text wordmark with a swappable accent colour until then.
4. ~~**Cash on Delivery**: offer it alongside SSLCommerz?~~ **Answered:** yes, COD is offered. Still open: should COD orders pay the delivery charge in advance? Also, the owner needs an **SSLCommerz merchant account** (it requires a trade licence).
5. Which **SSLCommerz methods** to enable (bKash, Nagad, Rocket, cards…)? *Pending.*
6. **Popup offer**: discount or updates only? *Decide later; it's editable in the admin.*
7. Should the popup also ask for a **phone/WhatsApp number** (optional field)?
8. **Delivery:** which courier (Pathao, Steadfast, RedX…), what charges inside and outside Dhaka, and is there a free-delivery threshold?
9. **Exchange/return policy** terms.
10. Keep the **New Arrivals** and **Sale** links in the header?
11. Which **social channels** to link, and a WhatsApp/Messenger number for chat?
12. **Domain name** (e.g. discountvai.com) and who pays for hosting?
13. Any other **Coming Soon** categories besides Women (e.g. Kids)?
14. Use Meta Pixel for Facebook ads tracking?

---

## 11. Next steps
1. User reviews this plan and answers the open questions they can.
2. User makes mockups in **Claude Design** from §5 and §7, at 390 / 768 / 1440.
3. We write a **build plan** (stack details, data models, milestones) and save it in `plans/`.
4. Only then: code, in git, following §1.

---

## Verification
- **Housekeeping, right after approval:**
  - `plans/2026-10-02-discount-vai-website-research-and-site-plan.md` exists and is listed in `plans/README.md`.
  - `CLAUDE.md` says "Discount Vai" and contains the Responsive and Git rules.
  - `git log` shows the first commit; `git status` is clean.
- **During the build** (repeat for every feature):
  - Check every page at 390 / 768 / 1440 in the browser.
  - Lighthouse scores 90+ on Performance, SEO and Accessibility (mobile).
  - Google Rich Results Test passes on product and category pages.
  - No `#` links (automated link check).
  - The popup follows its frequency rules (close it → it stays hidden on reload).
  - SSLCommerz sandbox payment works end-to-end, and a Cash on Delivery order shows up in the admin as "Unpaid – COD".
  - Each change is in its own git commit.
