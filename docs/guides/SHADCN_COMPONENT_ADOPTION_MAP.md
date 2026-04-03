# shadcn Component Adoption Map (Public Shop)

Last updated: 2026-02-17

## Latest references checked

- Navigation Menu docs: https://ui.shadcn.com/docs/components/navigation-menu
- Sidebar docs: https://ui.shadcn.com/docs/components/sidebar
- Blocks overview: https://ui.shadcn.com/docs/blocks
- Changelog (latest): https://ui.shadcn.com/docs/changelog
- Feb 2026 blocks update: https://ui.shadcn.com/docs/changelog/2026-02-blocks

## Current priority (now)

1. Header / Navbar enrichment
- Dynamic categories + sub-categories from DB.
- Account and cart quick access.
- Theme + language toggles.
- Mobile sheet navigation.

2. Storefront UX cohesion
- Reuse consistent section wrappers (`Card`, `Accordion`, `Sheet`, `Tabs`) across `/shop`, `/search`, `/categories`, `/school`, `/checkout`.

## Component adoption by page

### Global layout
- Header:
  - Use `Dropdown Menu` for category quick links and account actions.
  - Use `Sheet` for mobile navigation.
  - Use `Accordion` for nested mobile categories.
- Footer:
  - Keep lightweight links + contact actions.

### Home `/`
- Existing: `Card`, `Button`, pagination, sections.
- Next:
  - Consider `Carousel` for featured campaigns.
  - Consider `Tabs` for segmented featured lists (new/popular/discounted).

### Shop `/shop`
- Existing: filters + sort + URL-state pagination.
- Next:
  - Consider `Drawer/Sheet` pattern improvements for mobile filters.
  - Add optional `Skeleton` loading placeholders where needed.

### Categories `/categories` and `/categories/[slug]`
- Existing: dynamic categories and category listing.
- Next:
  - Add category quick-nav chips and optional sticky sub-nav pattern.

### Search `/search`
- Existing: URL-based query and filter/sort parity.
- Next:
  - Consider command-style search entry (`Command`) for fast keyword discovery.

### School `/school`
- Existing: code/link lookup + bundle add-to-cart flow.
- Next:
  - Add richer list summary cards and optional request/access CTA states.

### Checkout `/checkout`
- Existing: prefill + validation + order flow.
- Next:
  - Stepper-style section indicator using `Tabs`/segmented layout.

### Account `/my-account`
- Existing: profile update + order history/details.
- Next:
  - Add clearer account navigation cards and status badges.

## Planned component additions (not yet installed)

1. `navigation-menu` for richer desktop mega-nav.
2. `sidebar` for advanced navigation variants (if we shift to app-shell style).
3. Selected `blocks` for auth/account/dashboard patterns where helpful.

## Rule for implementation

- Keep data + processing in hooks/query utilities.
- Keep components presentational.
- Avoid page-level ad-hoc data parsing if the flow is shared.
