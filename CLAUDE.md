# Discount Vai Website: Project Rules

Rules for every Claude session working in this folder. They apply in every chat, including new ones.

## 1. All plans live in this project. No exceptions.

- **Every plan goes in [`plans/`](plans/) inside this project folder.** Never save a plan to `~/.claude/plans/`, a scratchpad, a temp directory, the memory directory, or anywhere else outside this project.
- This applies to plan-mode plans, research plans, design briefs, page plans, feature plans, and revisions of any of them.
- `.claude/settings.json` sets `plansDirectory` to `plans`, so plan mode writes here too. If a plan ever ends up somewhere else anyway, copy it into `plans/` right away, give it a proper name (see below), and tell the user.

## 2. Name plan files after the plan's title

- Format: `YYYY-MM-DD-plan-title-in-kebab-case.md`
  - Examples: `2026-10-02-competitor-website-research.md`, `2026-10-05-homepage-layout.md`
- The date is the day the plan was created, so the folder sorts in order. The rest is the plan's title, so the user can find it by name.
- Plan mode gives plan files random names (like `brave-dancing-fox.md`). **As soon as plan mode ends, rename the file to the title-based name.** Do not leave a randomly named plan in `plans/`.
- The first line of every plan is its title as a heading: `# Plan Title`.

## 3. Keep the plan index up to date

- [`plans/README.md`](plans/README.md) lists every plan. Each time a plan is created, renamed, or changes status, update its row in the index.
- Never delete an old plan. When a plan is replaced, set its status to `Superseded` and link to the plan that replaced it. The user wants to look back at past plans.

## 4. Use the same structure in every plan

Start each plan from this template and drop any section that doesn't apply:

```markdown
# <Plan Title>

- **Date:** YYYY-MM-DD
- **Status:** Draft | Approved | In design | In development | Done | Superseded
- **Related plans:** <links to other files in plans/>

## Goal
What this plan is for and what "done" looks like.

## Research and references
Websites studied, what was good or bad about each, with links.

## Scope
Pages, sections, or features covered here, plus anything left out on purpose.

## Page and section breakdown
Each page, then each section in order: purpose, content, components, and actions/CTAs.

## Design notes (for mockups)
Layout, visual style, colours, typography, imagery, mobile vs desktop behaviour,
interaction states (hover, empty, loading, error). This section must be detailed
enough for the user to make mockups in Claude Design from it.

## Content and copy
Headlines, text, labels, and the data each section needs.

## Open questions
Decisions the user still has to make.

## Implementation notes
Technical approach. Fill this in only once the plan reaches the build stage.
```

## 5. Workflow: plan, then design, then code

1. **Plan:** the user and Claude plan in chat. The plan is saved in `plans/` using the rules above.
2. **Design:** the user takes the plan to **Claude Design** and makes mockups from it.
3. **Code:** Claude builds the website from the approved mockups and the plan.

- **Do not write any website code until the user explicitly says to start building.** Until then, work stays at planning and research.
- When building starts, treat the mockups as the visual source of truth and the plan as the source for structure and content. If the two disagree, ask the user.

## 6. Responsive design: desktop, tablet and mobile (mandatory)

Every plan, mockup brief and piece of code must work on **desktop, tablet and mobile**. Nothing is finished until it has been checked at all three sizes.

| Device | Width range | Mockup / test frame |
|---|---|---|
| Mobile | 360–767px | 390px |
| Tablet | 768–1023px | 768px |
| Desktop | 1024px+ (content max-width ~1360px, centred) | 1440px |

- Every plan that describes UI must say how each part looks and behaves on all three devices.
- Build mobile-first. No horizontal scrolling at any width.
- Tap targets are at least 44×44px; body text is at least 16px on mobile.
- Never disable pinch-zoom.
- Every hover interaction needs a tap equivalent on touch screens.
- Tablet and mobile use the drawer menu; desktop uses the full header.
- Banners take separate desktop and mobile images from the admin.

## 7. Git workflow (mandatory)

Use git for every change, so any problem can be traced to the commit that caused it without re-reading the whole codebase.

- **One logical change per commit.** Never bundle unrelated changes.
- Message format: `type(area): what changed`, plus a line explaining *why* when it isn't obvious. Types: `feat`, `fix`, `style`, `content`, `seo`, `refactor`, `docs`, `chore`. Example: `feat(header): add Men mega menu with featured image`.
- `main` is always the working, approved version. Each task gets its own branch (`feature/<short-name>`), which is merged into `main` after the user approves it.
- Tag milestones (`v0.1-homepage`, `v0.2-catalog`, `v1.0-launch`).
- **When the user reports a problem, go to git first:** `git log` on the affected files, then `git diff`, `git blame`, and `git bisect` if needed. Tell the user which commit caused it (hash, message, what changed). Then fix it in a **new** commit. Never rewrite history.
- Commit plans and docs too. Secrets (`.env`, API keys, SSLCommerz credentials) are never committed.

## 8. Other standing rules

- **No dead links.** Nothing on the site may be unclickable or point to `#`. Anything not ready shows a friendly **"Coming Soon"** page or badge.
- **The owner can edit everything from the admin panel.** Don't hard-code text, images, banners, menus or SEO fields the owner might want to change.
- **Build for SEO on every page:** unique title and meta description, one H1, alt text on images, keyword URLs, and JSON-LD structured data.
- **No framework or vendor branding, ever.** The site and the admin panel must never show Next.js, Vercel or Payload logos, names or default assets. That means: no default `next.svg` / `vercel.svg` / `favicon.ico` from templates, our own favicon only (the DV monogram, or the one uploaded in the admin), `poweredByHeader: false` (no `X-Powered-By: Next.js` header), the Next.js dev indicator turned off, custom 404 and error pages, and the admin panel branded with the Discount Vai wordmark and page titles. Check for this whenever adding a dependency or template.
- **Styling must stay changeable at will.** Every colour, font, type size, spacing value, radius and shadow is a design token, defined once in a single theme file (CSS variables, wired into Tailwind). Components never hard-code colours, fonts or sizes. The logo and favicon come from the admin. Changing the palette or fonts should mean editing one file.

## Project facts

- **Brand:** Discount Vai. It is spelled **"Vai"**, never "Bhai".
- **What it is:** a Bangladeshi clothing e-commerce site with an owner-managed admin panel.
- **Launch categories:** MEN (Trousers, Shorts, 3/4 Pants, 2/4 Pants, Club Jerseys, Jackets, Drop T-Shirts, Panjabi) and ACCESSORIES (Bags, unisex). WOMEN is Coming Soon.
  - "2/4 Pants" = half pants; "Drop T-Shirts" = drop-shoulder T-shirts. Menu labels stay as the owner wrote them; URLs and SEO text use "half pants" and "drop shoulder".
- **Decisions so far:** custom Next.js site with a built-in admin panel; payments by **Cash on Delivery** and **SSLCommerz** (online); English at launch, Bangla-ready; popup offer to be decided later.
- **Logo and brand colours:** none yet; the user will decide them. Until then, use a text wordmark "Discount Vai" and keep the accent colour in a single token so it can be swapped everywhere at once.
- **Current stage:** built and approved. All 8 milestones of [`plans/2026-10-02-discount-vai-build-plan.md`](plans/2026-10-02-discount-vai-build-plan.md) are done (Next.js + Payload CMS admin at `/admin` + PostgreSQL) and merged into `main` on 2026-10-06, tagged `v0.9-build-complete`. Next: owner content and accounts, then deployment; tag `v1.0-launch` when the site goes live. New work starts on a fresh `feature/<name>` branch from `main`. **Awaiting review:** `feature/stock-fixes` → `feature/code-audit` (stock fixes, COD-only payments, and a 23-item audit; see [`plans/2026-10-13-stock-fixes-and-code-audit.md`](plans/2026-10-13-stock-fixes-and-code-audit.md)). Run `npm run check:shop` after changing stock or order code. Its Progress section lists the placeholders the owner still has to fill, and its Deployment section covers going live. Run instructions are in [`README.md`](README.md).
- **Seeding:** `npm run seed` wipes and reloads the dummy catalogue (local only; it refuses live databases). `npm run seed:structure` loads only categories, size guides, pages and settings into an empty database (for a new live shop).
- **Mockups:** the Claude Design source files are in [`design/claude-design-mockups/`](design/claude-design-mockups/). Read its [`README.md`](design/claude-design-mockups/README.md) first: it maps every page and component to its file and explains the `.dc.html` format (the files need Claude Design to render, so read them as a spec). Design tokens are in `dv.css`, component styles in `site.css`, dummy catalogue in `dvdata.js`.
