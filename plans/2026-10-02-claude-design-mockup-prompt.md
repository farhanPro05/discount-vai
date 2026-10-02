# Claude Design Mockup Prompt

- **Date:** 2026-10-02
- **Status:** Ready to use
- **Related plans:** [Discount Vai Website: Research and Site Plan](2026-10-02-discount-vai-website-research-and-site-plan.md)

## How to use
1. Open Claude Design and start a new project.
2. Paste everything under **"The prompt"** below. You can also attach the site plan file for extra context, but the prompt works on its own.
3. When the palettes and the product display options (A / B / C) come back, pick one of each (or ask for changes) and let it finish the pages.
4. **Already pasted the earlier version?** Send the "Product display options" section below as a follow-up message instead of starting over.
5. Once the mockups are approved, share them back here so the build plan can be written from them.

---

## The prompt

# Project: Discount Vai — full e-commerce website mockups

You're designing the complete website for **Discount Vai**, a new Bangladeshi online clothing brand. "Vai" means "brother" in Bangla, so the brand should feel friendly, trustworthy, good value and well made. At launch it sells **menswear and unisex bags**; a women's line comes later. There is **no logo, no brand colours, no product photos and no product copy yet**, so use placeholder and dummy content throughout.

Please work in the order below and deliver everything listed.

## Part 1 — Brand exploration (do this first)

**1. Colour palettes (research first).**
- Look at the palettes of well-regarded fashion and lifestyle retailers (for example COS, Uniqlo, Arket, Everlane, Aarong, Yellow, Le Reve) and at current colour trends in fashion e-commerce.
- Then propose **4 palette options** for Discount Vai.
- **Mood:** calm, pleasant and modern. Use soft/pastel or balanced mid-tone colours that simply look good.
- **Not flashy:** no bright or pure red, no bright yellow, no neon, no harsh saturated colours.
- It must suit menswear now and womenswear later, so avoid anything overly masculine or feminine.
- Sale prices, discount badges and "Add to cart" buttons must still stand out clearly. Use a deeper or warmer shade from the palette, not loud red.
- **Each palette needs:**
  - a name and a one-line mood;
  - hex values for: page background, surface/card, text primary, text secondary, border, primary (buttons), primary hover, accent (sale price and discount badge), soft accent (tinted backgrounds), success, error, warning.
- **Contrast:** every text/background and button combination must pass **WCAG AA**. Pastels belong on backgrounds and surfaces; text and buttons use deeper shades. Show the contrast ratios.
- **Comparison:** apply each palette to the same sample: header, a product card on sale, a primary button, a badge and a banner.
- **Starting ideas** (refine or replace them):
  - sage green + warm sand + charcoal;
  - dusty blue + cream + navy, with terracotta for sale;
  - muted terracotta + stone + espresso;
  - olive + ivory + deep brown.
- **Recommend one** and explain why.

**2. Temporary wordmark.**
- No logo exists yet. Make **3 simple text wordmark** concepts for "Discount Vai" (typographic only; for example, one where "Vai" is emphasised).
- Add a small **"DV" monogram** for the favicon.
- These are placeholders, so keep them simple; a real logo will replace them later.

**3. Typography.**
- Propose **2 font pairings** (headings + body) from Google Fonts.
- They must look good next to a **Bangla font added later** (e.g. Hind Siliguri, Noto Sans Bengali or Anek Bangla). Show a sample line in Bangla alongside each pairing.

## Part 2 — Design system

**Build every screen from design tokens**: colours, fonts, type scale, spacing, corner radius and shadows. Palette, fonts and logo must be changeable at any time without redesigning anything.

**Add a palette switcher to the prototype** so I can preview every page in each of the 4 palettes. The default is the recommended one.

Create a design-system page showing:
- **Foundations:** colour tokens, type scale, spacing, corner radius, shadows, and one consistent open-source icon set (e.g. Lucide).
- **Controls:**
  - buttons: primary, secondary, ghost, disabled, loading;
  - inputs: default, focus, error;
  - size buttons: available, selected, out of stock;
  - colour swatches, quantity stepper.
- **Product display:**
  - badges: `NEW`, `-20%`, `SOLD OUT`, `SOON`;
  - product card: default, on sale, new, sold out;
  - category tile.
- **Navigation:** chips, tabs, accordion, breadcrumb, pagination with "Load more".
- **Feedback:** toasts, skeleton loaders, empty states.
- **Containers:** modal, bottom sheet, drawer.

## Part 3 — Product display options (show me 3 layouts before choosing)

Products are the heart of the site, so design **3 different ways of displaying products** for me to compare before the grids are finalised. Apply each option to:
- the **homepage product sections**: New Arrivals, Best Sellers, Featured collection;
- a **category page**: Panjabi.

Show both at 390 / 768 / 1440.

**Option A: Classic grid** (like ravebd.com)
- Uniform rows and columns: 4 per row on desktop, 3 on tablet, 2 on mobile.
- Every image is the same size on a plain, clean card.
- Under each image: "Name | Colour", the price, and small colour-swatch dots.
- Centred section titles ("NEW ARRIVALS").
- Simple and very easy to scan; good for browsing many products and spotting deals.

**Option B: Image-first fashion grid** (like lerevecraze.com)
- Large, tall 4:5 photos dominate the card. The text is minimal: the name on one line, then the price.
- Each card swipes (mobile) or hovers (desktop) through several photos, with thin indicator bars under the image.
- Tight gutters, and a slim filter bar at the top (Colour · Price · Sort by).
- On the homepage, full-width campaign images ("Shop this look") sit between the product rows.

**Option C: Editorial / mixed layout** (like rebeccaatwood.com)
- A magazine feel with generous white space.
- Product cards are mixed with large lifestyle photos and short text blocks, in varied tile sizes (e.g. one large feature tile beside two small ones, or staggered heights).
- Homepage products sit in horizontal carousels that run off the edge of the screen (the next card is partly visible), with arrow controls.
- Elegant centred captions under each image: "Classic Cotton Panjabi" and then *in White* in italics.
- On the category page:
  - a banner image;
  - a centred title with the product count;
  - on desktop, filters as accordions in a left sidebar;
  - 3 columns of large images.

**Rules for every option**
- **The price is always visible on every product card**, including the sale price, the struck-through original price and the discount badge. We're a discount brand, so this matters even in the editorial option.
- It must work at all 3 widths. Editorial layouts must collapse cleanly to a readable 2-column or 1-column layout on mobile.
- Use the same design tokens and palette switcher as everything else.

You may also propose an **Option D: a hybrid** (e.g. an editorial homepage with a classic grid on category pages) if you think it's better.

**Recommend one option**, judging each on:
- how easy it is to browse;
- how well it shows discounts;
- how usable it is on mobile;
- how premium it feels.

Add a **layout switcher** to the prototype, next to the palette switcher, so I can flip between the options on the homepage and the category page. After I choose, build the remaining pages in the chosen layout.

## Part 4 — Pages

Design **every page at three widths: Mobile 390px, Tablet 768px and Desktop 1440px**, side by side and labelled.

**Rules for every page:**
- **Layout:**
  - Mobile-first; no horizontal scrolling; tap targets at least 44px; body text at least 16px on mobile.
  - Desktop content max-width about 1360px, centred.
  - Tablet and mobile use a hamburger drawer; desktop uses the full header with a mega menu.
- **No dead links:** anything not ready yet shows a "SOON" badge and leads to a Coming Soon page.
- **Prices** are in Bangladeshi Taka, formatted `৳1,450`. Sale prices show the original price struck through, plus "You save ৳X".
- **Photos:** product photos are **4:5 portrait**.
  - Use realistic placeholder fashion photos (models or flat-lays on clean, consistent backgrounds).
  - If you can't, use tasteful 4:5 placeholders labelled with the product type.
- **Tone:** warm, short, friendly English with a little "bro" personality ("Vai's Picks", "Vai's Deals"), never cheesy.

### Global elements
- **Announcement bar:** 1–3 rotating messages, e.g. "Free delivery on orders over ৳2,000 · Easy 7-day exchange".
- **Desktop header:**
  - Wordmark on the left.
  - Nav in the centre: MEN ▾ · WOMEN [SOON] · ACCESSORIES ▾ · NEW ARRIVALS · SALE.
  - Search, account, and cart with item count on the right.
  - After scrolling, a slim sticky version replaces it and the announcement bar hides.
- **Men mega menu:**
  - Bottoms: Trousers, Shorts, 3/4 Pants, 2/4 Pants.
  - Tops & Outerwear: Drop T-Shirts, Club Jerseys, Jackets.
  - Traditional: Panjabi.
  - Quick links: Shop All Men, New In, Sale.
  - A featured image tile with a tagline and "Shop now".
- **Accessories dropdown:** Bags (Unisex), Shop All Accessories, and a featured image.
- **Mobile/tablet header:** ☰ on the left, wordmark in the centre, search and cart on the right.
  - **Drawer:** search field at the top, then:
    - Men › (expands to all 8 subcategories + Shop All);
    - Women [SOON];
    - Accessories ›;
    - New Arrivals;
    - Sale;
    - a divider;
    - Account, Track Order, Help & Contact;
    - social icons.
- **Footer:**
  - Wordmark and a one-line brand promise.
  - Columns:
    - Shop: Men, Accessories, Women [Soon], New Arrivals, Sale.
    - Help: Contact, FAQ, Size Guide, Shipping & Delivery, Returns & Exchange, Track Order.
    - Company: About, Style Guide [Soon], Privacy, Terms.
  - Newsletter form.
  - Social icons: Facebook, Instagram, TikTok, WhatsApp.
  - Payment row: "Cash on Delivery · bKash · Nagad · Visa · Mastercard".
  - © Discount Vai.
  - A floating WhatsApp chat button, bottom right.
- **Email signup popup** (show every state):
  - **Desktop/tablet:** a centred split modal.
    - Left: lifestyle photo, "Be the first to know", and 3 benefit icons (New drops / Members-only deals / Early access).
    - Right: headline, one line of copy, an offer-line placeholder, email field, big "Join the Vai List" button, "No spam, unsubscribe anytime" with a Privacy link, and a close ✕.
  - **Mobile:** a bottom sheet about 60% of screen height, with a slim photo strip on top and a big ✕.
  - **States:** default, invalid-email error, loading, success ("You're on the list!" with a sample code `VAI10`).
  - **Annotate the behaviour:**
    - It appears after about 70% scroll or near the footer.
    - It shows once per visit.
    - It stays hidden for 7 days after being closed.
    - It never appears on cart or checkout.

### Pages to design

**1. Home.** Top to bottom:
1. Hero slider: 3 slides; show that desktop and mobile use different crops.
2. Shop by Category: 9 tiles (Trousers, Shorts, 3/4 Pants, 2/4 Pants, Club Jerseys, Jackets, Drop T-Shirts, Panjabi, Bags), 4 / 3 / 2 per row by breakpoint.
3. New Arrivals carousel.
4. Deal banner with a countdown: "Vai's Deals of the Week".
5. Featured collection, "Panjabi for Eid": a big lifestyle image with 4 products.
6. Best Sellers.
7. Bags spotlight: split image and text.
8. Women's teaser: "Coming soon — get notified".
9. Trust strip: Easy exchange · Delivery across Bangladesh · Cash on Delivery & secure online payment · Quality fabrics.
10. Customer reviews: photo, 5 stars, short quote, name and city.
11. Short SEO text block, "About Discount Vai".
12. Footer.

**2. Men landing (/men).**
- Breadcrumb, H1 "Men's Clothing", 2-line intro with "Read more".
- Subcategory chips, then a filter/sort bar.
- Product grid: 4 / 3 / 2 columns.
- "Load more" with page numbers.
- An FAQ block at the bottom.

**3. Subcategory listing: Panjabi.**
- Same template as Men landing.
- Also show the **filters open**:
  - Desktop: dropdowns.
  - Mobile: Filter and Sort bottom sheets.
  - Filters: Size, Colour, Price range. Sort: Newest, Price low→high, Price high→low, Best selling.
- Show the **no-results empty state**.

**4. Product page.**
- Breadcrumb.
- Gallery:
  - Desktop: vertical thumbnails plus a large image.
  - Mobile: a swipe carousel with dots.
- H1 product name.
- Price, the original price struck through, and "You save ৳X".
- Colour swatches.
- Size buttons, with one size out of stock, and a "Size Guide" link.
- "Only 3 left".
- Quantity, then Add to Cart and Buy Now.
- Delivery line: Inside Dhaka ৳70, 1–2 days · Outside Dhaka ৳130, 2–4 days.
- Exchange line.
- Accordions:
  - Description.
  - Details: Fabric, Fit, Care, SKU.
  - Delivery & Exchange.
- Share: Facebook, WhatsApp, copy link.
- "You may also like" and "Recently viewed".
- Mobile: a **sticky Add to Cart bar**.
- Also show:
  - the **Size Guide modal** (size chart table and how-to-measure);
  - the "Added to cart" toast.

**5. Bags listing (Accessories).** The category template with bag products: one size, so no size filter.

**6. Sale page.** The category template with all sale items and discount badges, plus a top banner.

**7. Women: Coming Soon.** A branded page with:
- "Women's collection is coming soon";
- a short teaser;
- a "Notify me" email field;
- links to shop Men and Bags in the meantime.

**8. Search.**
- Desktop overlay / mobile full-screen, with live suggestions (products with thumbnails, plus matching categories).
- Results page.
- A "no results" state with popular categories.

**9. Cart.**
- Slide-in cart drawer with:
  - items, quantity, remove;
  - subtotal;
  - a free-delivery progress bar ("Add ৳350 more for free delivery");
  - Checkout and View cart buttons.
- The full cart page.
- The empty-cart state.

**10. Checkout.** A single page; guest checkout allowed. Sections in order:
1. Contact: phone required, email optional.
2. Delivery address: name, district/city, area, full address.
3. Delivery zone: Inside Dhaka / Outside Dhaka.
4. Order notes and a discount code.
5. **Payment: two large selectable cards, "Cash on Delivery" and "Pay online (bKash, Nagad, cards via SSLCommerz)".**
6. Newsletter opt-in checkbox.
7. Order summary (sticky on desktop).
8. Place Order button.

**11. Order confirmation and payment failed.**
- Confirmation: order number, summary, what happens next.
- Payment failed: a retry button.

**12. Account.**
- Login / register (phone or email).
- Order history list.
- Order detail with a status timeline: Pending → Confirmed → Shipped → Delivered.

**13. Info page template.** Shown as About Us, plus an FAQ page (accordion) and a Returns & Exchange policy page in the same template.

**14. Contact page.** A form plus phone, WhatsApp, email and Facebook.

**15. 404 page.** A friendly message, a search box and category links.

## Dummy catalogue (use these, and invent more in the same style to fill grids)

| Category | Product (colour) | Price | Sale price | Sizes |
|---|---|---|---|---|
| Trousers | Slim Fit Cotton Chino (Khaki) | ৳1,850 | ৳1,450 | 28–40 |
| Trousers | Relaxed Twill Trouser (Charcoal) | ৳1,950 | — | 28–40 |
| Shorts | Everyday Cotton Shorts (Navy) | ৳890 | ৳690 | S–XXL |
| Shorts | Drawstring Linen-Blend Shorts (Olive) | ৳990 | — | S–XXL |
| 3/4 Pants | Cargo 3/4 Pant (Stone) | ৳1,150 | ৳950 | S–XXL |
| 3/4 Pants | Jogger 3/4 Pant (Black) | ৳1,050 | — | S–XXL |
| 2/4 Pants | Cotton Half Pant (Grey Melange) | ৳750 | ৳590 | S–XXL |
| 2/4 Pants | Printed Half Pant (Teal) | ৳790 | — | S–XXL |
| Club Jerseys | Home Club Jersey 25/26 (Red/White) | ৳1,250 | — | S–XXL |
| Club Jerseys | Away Club Jersey 25/26 (Sky Blue) | ৳1,250 | ৳1,050 | S–XXL |
| Jackets | Lightweight Bomber Jacket (Olive) | ৳3,250 | ৳2,650 | M–XXL |
| Jackets | Denim Trucker Jacket (Mid Blue) | ৳3,450 | — | M–XXL |
| Drop T-Shirts | Oversized Drop-Shoulder Tee (Off-White) | ৳690 | ৳550 | S–XXL |
| Drop T-Shirts | Graphic Drop-Shoulder Tee (Black) | ৳750 | — | S–XXL |
| Panjabi | Classic Cotton Panjabi (White) | ৳2,450 | ৳1,990 | S–XXL |
| Panjabi | Embroidered Festive Panjabi (Maroon) | ৳3,850 | — | S–XXL |
| Panjabi | Slub Cotton Panjabi (Sage) | ৳2,250 | — | S–XXL |
| Bags | Everyday Canvas Tote (Natural) | ৳950 | — | One size |
| Bags | Urban Backpack (Black) | ৳2,450 | ৳1,990 | One size |
| Bags | Crossbody Sling Bag (Brown) | ৳1,350 | — | One size |

- Club jerseys are generic. Don't use real club names, crests or sponsor logos.
- Example reviewers: "Rafi, Dhaka", "Arif, Chattogram", "Nayeem, Sylhet".
- The delivery charges and free-delivery threshold above are placeholder values.

## Deliverables
1. **Brand exploration board:** 4 palettes with contrast checks, 3 wordmarks plus the monogram, 2 font pairings, and your recommendation.
2. **Design system page.**
3. **Product display options board:** Options A / B / C (plus D if proposed) on the homepage and the Panjabi category page at 3 widths, with your recommendation.
4. **Every page above** at 390 / 768 / 1440, including the key states.
5. **A clickable prototype** linking the pages, with the palette switcher and the layout switcher.
6. **A tokens summary** to hand to the developer: final hex codes, fonts, type sizes, spacing and radius.

No admin panel screens are needed; the site uses an existing admin system.
