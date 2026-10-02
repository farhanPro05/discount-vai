# Discount Vai: Claude Design mockups (Option D)

These are the source files of the approved mockups made in Claude Design on 2026-10-02.
They are the **visual source of truth** for building the site (see `CLAUDE.md`, section 5).

- **Live canvas (view, click through, switch palette and width):** https://claude.ai/artifact/3kFRHJuihm3i8qkQHxZAEs
  It is private to the owner's account until shared from its Share menu.
- **Product display layout:** Option D, the hybrid. See `plans/2026-10-02-discount-vai-website-research-and-site-plan.md`.

## Important: these files do not open on their own

Each `*.dc.html` file is a Claude Design component, not a normal web page. It needs Claude Design's
runtime (`support.js`) to render, so double-clicking it in a browser shows little or nothing.
To **see** a design, open the canvas link. To **build** from it, read the files as a spec: the
markup shows structure and copy, the CSS shows every measurement and colour, and the script block
at the bottom of each file shows the data and the behaviour (what is clickable and what it does).

Template syntax you will see:
- `{{name}}` is a value filled in from the script's `renderVals()`.
- `<sc-if value="{{x}}">` shows its content only when `x` is true.
- `<sc-for list="{{items}}" as="p">` repeats its content once per item.
- `<dc-import name="Card" ...>` places another component (here `Card.dc.html`), passing attributes as props.
- `bp-m`, `bp-t`, `bp-d` on the root are the mobile (390), tablet (768) and desktop (1440) breakpoints.

## Where to look

| What you need | File |
|---|---|
| **Design tokens** (4 palette presets, radius, spacing per breakpoint, type families) | `dv.css` (top: `.pal-sage`, `.pal-harbour`, `.pal-clay`, `.pal-olive`, `.dv`, `.bp-*`) |
| **Component styles** for every page (header, mega menu, drawer, footer, cards, filters, sheets, checkout, account, info) | `site.css` |
| **Product card** (Option D: swipe/hover photos, indicator bars, name, price, struck price, -% badge, swatches) | `Card.dc.html` + `.cd` rules in `dv.css` |
| Header, sticky header, Men mega menu, Accessories dropdown, mobile drawer, WhatsApp button | `Header.dc.html` |
| Footer | `Footer.dc.html` |
| Email signup popup (modal, bottom sheet, error, loading, success) | `Popup.dc.html` |
| Home (all 12 sections) | `Home.dc.html` |
| Men, Panjabi, Bags, Sale, Search results (one template), filters open, sort open, empty states | `Listing.dc.html` (`kind` and `state` props) |
| Search overlay with live suggestions | `Search.dc.html` |
| Product page, Size Guide, added-to-cart toast, sticky mobile Add to Cart | `Product.dc.html` |
| Cart drawer, cart page, empty cart | `Cart.dc.html` |
| Checkout | `Checkout.dc.html` |
| Order confirmed, payment failed | `Order.dc.html` |
| Log in / register, order history, order detail timeline | `Account.dc.html` |
| About, FAQ, Returns & Exchange, Contact, 404, Women coming soon, generic Coming Soon | `Info.dc.html` |
| Dummy catalogue, prices, Taka formatting, list contents | `dvdata.js` |
| Which page and state each route shows | `Screen.dc.html` (route table in its script) |
| Clickable prototype (page, palette and width switchers) | `Main.dc.html` |

Boards that lay pages out at 390 / 768 / 1440 for review: `T-*.dc.html` (pages) and `G-*.dc.html`
(global elements). They only arrange the components above; they hold no extra design.

Layout comparison kept for the record: `Options.dc.html`, `Home-A..D.dc.html`, `Panjabi-A..D.dc.html`.

## Still placeholders

- The 4 palettes are provisional. The default is Sage & Sand (`.pal-sage`). Keep them as switchable theme presets.
- Fonts: Archivo (headings) and Hanken Grotesk (body), from Google Fonts. Not final.
- No logo yet: the wordmark is text ("Discount **Vai**").
- Product photos are 4:5 placeholders drawn as garment outlines; lifestyle images are tinted blocks.
- Phone, email, courier and tracking details are in [square brackets].

## Updating

If the mockups change in Claude Design, copy the new files from the canvas into this folder again
and commit them, so this folder always matches the canvas.
