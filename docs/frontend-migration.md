# Frontend preservation and migration

## Decision and current state

The user requires preservation of the existing themes and implemented pages while
improving code architecture and UI/UX. The original frontend experience is the
migration baseline. A feature being outside the earlier phase-one scope does not
permit its deletion. Any deliberate omission requires the user's explicit approval.

`frontend/storefront` and `frontend/dashboard` are restored from
`4b3bf43c25594a1c24c57e02596876bb8ed5cd23` (the parent of the deletion commit
`18455b7`). All 640 tracked files are preserved; only their root README banners
are added to identify reference status. This includes local components, styles,
translations, assets, configuration, and tests. Ignored build outputs and locally
untracked files are not part of that Git baseline. The existing `frontend/ui`
package also remains preserved.

These two reference apps remain outside `pnpm-workspace.yaml`; their historical
scripts are not supported startup instructions. `frontend/web` remains the active
runtime with the current authorization, transaction, and migration guarantees.
For an isolated historical comparison, use a separate checkout of the baseline;
do not connect its seed scripts to an existing database.

**Restoration is complete; enhanced frontend migration is still pending.** No page
below has signed-off feature or visual parity. The target currently has selected
commerce, list, partner-access, and catalog-management flows, not the entire old
frontend. Source existence also does not prove every old page was fully functional:
record existing defects when establishing the visual and behavioral baseline.

## Theme and presentation preservation

| Baseline source                                                                                                                       | Preserve and verify during migration                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Both apps' `src/app/globals.css` and `tailwind.config.ts`                                                                             | Brand colors, semantic tokens, light/dark surfaces, spacing, radii, responsive rules, and animation. Inspect rendered CSS before consolidating: the old CSS uses hex tokens while parts of the Tailwind configuration wrap tokens in `hsl(...)`; copying both blindly is not a safe enhancement. |
| Both apps' `src/app/layout.tsx` and locale layouts                                                                                    | Inter/Cairo typography, Arabic RTL and English LTR, icons, layout proportions, locale behavior, and hydration.                                                                                                                                                                                   |
| Both apps' `src/providers/ThemeProvider.tsx`, `src/hooks/useTheme.ts`, provider composition; `frontend/ui/src/shared/ToggleTheme.tsx` | Theme choice, system preference, persistence, and no incorrect-theme flash. Audit actual wiring separately in each app. Do not carry over the Dashboard provider's global `console.error` suppression.                                                                                           |
| Both apps' `src/components/layout`, `src/components/shared`, and route-local components                                               | Header, footer, mega menu, mobile navigation, search, product presentation, dashboard navigation, loading/error/empty states, forms, and notifications.                                                                                                                                          |
| `frontend/ui/src/ui`, `frontend/ui/src/shared`, and `frontend/ui/src/lib`                                                             | Existing primitives, Logo, Price, icons, grids, pagination, and reusable visual behavior. Keep brand assets; consolidate duplicate presentation only after comparing consumers.                                                                                                                  |
| Both apps' `messages/en.json` and `messages/ar.json`                                                                                  | Existing content and translation coverage; preserve equivalent navigation context when switching locale.                                                                                                                                                                                         |
| `frontend/storefront/public` and assets referenced by styles/components/data                                                          | Tracked favicon and product placeholder, plus references to externally hosted images/fonts/icons. Preserve references; external availability has not been verified or archived.                                                                                                                  |
| Both apps' Cypress and unit tests                                                                                                     | Existing scenarios and selectors as migration evidence. Port useful user journeys to the target; do not assume current target tests cover every old page.                                                                                                                                        |

These directories cover the non-page implementation as well as the page inventory
below. The inventory does not authorize deleting an unlisted helper or asset.

## Architecture and UX migration sequence

1. **Establish the reference.** Capture the original screens with disposable fixtures
   where they can run: Arabic/English, desktop/mobile, light/dark, and relevant
   loading, empty, error, and permission states. Record broken baseline behavior
   and external asset dependencies rather than treating them as features to copy.
2. **Migrate the theme and shells first.** Preserve the FindEg brand and typography;
   consolidate semantic design tokens and one theme interface in the active web
   host. Reuse the existing UI package where actual reuse is demonstrated. Build
   the Storefront and Back Office shells with responsive navigation, accessible
   focus states, keyboard operation, contrast, and reduced-motion handling.
3. **Migrate browsing as one usable slice.** Home, shop/search, product detail,
   categories, and collections must retain navigation and useful content. Connect
   page adapters to the target Catalog operations. Add missing owner operations
   before claiming a screen works; do not reconnect old repository/query imports.
4. **Migrate customer journeys.** Apply the preserved presentation to Cart and
   checkout while retaining the current transaction and retry guarantees. Add
   account, order history/detail, settings, and registration through target
   Identity & Access and Commerce operations. Existing Guest Order Access does
   not replace a customer's order-history page.
5. **Migrate school and partner journeys.** Preserve discovery and school-list
   entry experiences, map old links to the new list model, and retain the target
   Partner Workspace authorization. Keep old URLs working through reviewed
   mappings or redirects where routes are consolidated.
6. **Migrate Back Office workflows.** Products, inventory, taxonomy, orders,
   people, notifications, media, reporting, and audit pages move behind target
   authorized operations. The current CatalogManager and partner screens are
   partial replacements only. Missing backend capability is tracked work, not
   permission to remove a screen.
7. **Review and retire incrementally.** Record target files, route mappings,
   relevant test results, visual comparisons, and user acceptance per row. Only
   then remove the superseded reference material. Keep anything without approved
   replacement evidence, including its theme and assets.

Page adapters own route input and result presentation. Business rules remain
behind the public interface of their owning backend module; runtime composes
concrete adapters. Client code receives browser-safe data/contracts, never database
connections or infrastructure imports. Shared UI exposes presentation behavior;
it must not accumulate permissions, checkout rules, or database access. This
follows ADR 0001 while allowing the existing visual work to be improved.

The initial UX direction is to retain the current brand and page capabilities,
then improve consistency, responsive navigation, accessible interactions, clear
form feedback, and discoverability. A wholesale visual rebrand is not implied.

## Page inventory

Every tracked `page.tsx` in both reference apps appears below. URLs are derived
from the source path with Next.js route groups removed; parameter names differ
between some old and target routes. “Related target” identifies code to examine,
not a parity claim or an approved redirect. Routes without a related target remain
required migration work. All rows are **pending migration and visual/behavior review**.

### Storefront (24 page files)

| Original page                                                                                                                                                 | Original URL                       | Related target / gap                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------- |
| [[locale]/(auth)/login/page.tsx](<../frontend/storefront/src/app/[locale]/(auth)/login/page.tsx>)                                                             | `/[locale]/login`                  | `/[locale]/sign-in` — target sign-in; route mapping pending                 |
| [[locale]/(auth)/registration/page.tsx](<../frontend/storefront/src/app/[locale]/(auth)/registration/page.tsx>)                                               | `/[locale]/registration`           | No dedicated target page; preserve for customer migration                   |
| [[locale]/(school-list)/lists/[slug]/page.tsx](<../frontend/storefront/src/app/[locale]/(school-list)/lists/[slug]/page.tsx>)                                 | `/[locale]/lists/[slug]`           | `/[locale]/lists/[code]` — target list model; link/data mapping pending     |
| [[locale]/(storefront)/(user)/dashboard/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/(user)/dashboard/page.tsx>)                           | `/[locale]/dashboard`              | No dedicated target page; preserve for customer migration                   |
| [[locale]/(storefront)/(user)/my-account/orders/[id]/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/(user)/my-account/orders/[id]/page.tsx>) | `/[locale]/my-account/orders/[id]` | No dedicated target page; preserve for customer migration                   |
| [[locale]/(storefront)/(user)/my-account/orders/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/(user)/my-account/orders/page.tsx>)           | `/[locale]/my-account/orders`      | No dedicated target page; preserve for customer migration                   |
| [[locale]/(storefront)/(user)/my-account/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/(user)/my-account/page.tsx>)                         | `/[locale]/my-account`             | No dedicated target page; preserve for customer migration                   |
| [[locale]/(storefront)/(user)/my-account/settings/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/(user)/my-account/settings/page.tsx>)       | `/[locale]/my-account/settings`    | No dedicated target page; preserve for customer migration                   |
| [[locale]/(storefront)/about/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/about/page.tsx>)                                                 | `/[locale]/about`                  | No dedicated target page; preserve for customer migration                   |
| [[locale]/(storefront)/categories/[slug]/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/categories/[slug]/page.tsx>)                         | `/[locale]/categories/[slug]`      | `CatalogBrowser.tsx` — basic browsing; dedicated page parity pending        |
| [[locale]/(storefront)/categories/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/categories/page.tsx>)                                       | `/[locale]/categories`             | `CatalogBrowser.tsx` — basic browsing; dedicated page parity pending        |
| [[locale]/(storefront)/checkout/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/checkout/page.tsx>)                                           | `/[locale]/checkout`               | `StorefrontShopping.tsx` — embedded checkout; dedicated route/UX pending    |
| [[locale]/(storefront)/collections/[slug]/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/collections/[slug]/page.tsx>)                       | `/[locale]/collections/[slug]`     | `CatalogBrowser.tsx` — basic browsing; dedicated page parity pending        |
| [[locale]/(storefront)/collections/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/collections/page.tsx>)                                     | `/[locale]/collections`            | `CatalogBrowser.tsx` — basic browsing; dedicated page parity pending        |
| [[locale]/(storefront)/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/page.tsx>)                                                             | `/[locale]`                        | `/[locale]` / `StorefrontShopping.tsx` — selected commerce flows            |
| [[locale]/(storefront)/products/[slug]/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/products/[slug]/page.tsx>)                             | `/[locale]/products/[slug]`        | `CatalogBrowser.tsx` — basic browsing; dedicated page parity pending        |
| [[locale]/(storefront)/school-lists/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/school-lists/page.tsx>)                                   | `/[locale]/school-lists`           | `/[locale]/lists` provides code entry only; school discovery not equivalent |
| [[locale]/(storefront)/school/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/school/page.tsx>)                                               | `/[locale]/school`                 | `/[locale]/lists` provides code entry only; school discovery not equivalent |
| [[locale]/(storefront)/schools/[slug]/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/schools/[slug]/page.tsx>)                               | `/[locale]/schools/[slug]`         | `/[locale]/lists` provides code entry only; school discovery not equivalent |
| [[locale]/(storefront)/schools/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/schools/page.tsx>)                                             | `/[locale]/schools`                | `/[locale]/lists` provides code entry only; school discovery not equivalent |
| [[locale]/(storefront)/search/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/search/page.tsx>)                                               | `/[locale]/search`                 | `CatalogBrowser.tsx` — basic browsing; dedicated page parity pending        |
| [[locale]/(storefront)/shop/[[...slug]]/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/shop/[[...slug]]/page.tsx>)                           | `/[locale]/shop/[[...slug]]`       | `CatalogBrowser.tsx` — basic browsing; dedicated page parity pending        |
| [[locale]/(storefront)/shop/products/[slug]/page.tsx](<../frontend/storefront/src/app/[locale]/(storefront)/shop/products/[slug]/page.tsx>)                   | `/[locale]/shop/products/[slug]`   | `CatalogBrowser.tsx` — basic browsing; dedicated page parity pending        |
| [page.tsx](../frontend/storefront/src/app/page.tsx)                                                                                                           | `/`                                | Target root redirect; verify destination and locale handling                |

### Dashboard (23 page files)

| Original page                                                                                                                                        | Original URL                           | Related target / gap                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| [[locale]/(dashboard)/account/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/account/page.tsx>)                                       | `/[locale]/account`                    | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/audit-log/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/audit-log/page.tsx>)                                   | `/[locale]/audit-log`                  | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/brands/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/brands/page.tsx>)                                         | `/[locale]/brands`                     | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/catalog/collections/[id]/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/catalog/collections/[id]/page.tsx>)     | `/[locale]/catalog/collections/[id]`   | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/catalog/collections/new/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/catalog/collections/new/page.tsx>)       | `/[locale]/catalog/collections/new`    | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/catalog/collections/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/catalog/collections/page.tsx>)               | `/[locale]/catalog/collections`        | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/catalog/tags/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/catalog/tags/page.tsx>)                             | `/[locale]/catalog/tags`               | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/categories/[id]/edit/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/categories/[id]/edit/page.tsx>)             | `/[locale]/categories/[id]/edit`       | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/categories/new/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/categories/new/page.tsx>)                         | `/[locale]/categories/new`             | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/categories/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/categories/page.tsx>)                                 | `/[locale]/categories`                 | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/editorial/search-analytics/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/editorial/search-analytics/page.tsx>) | `/[locale]/editorial/search-analytics` | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/inventory/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/inventory/page.tsx>)                                   | `/[locale]/inventory`                  | `/[locale]/back-office` / `CatalogManager.tsx` — partial catalog/inventory flow |
| [[locale]/(dashboard)/media/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/media/page.tsx>)                                           | `/[locale]/media`                      | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/notifications/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/notifications/page.tsx>)                           | `/[locale]/notifications`              | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/orders/[id]/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/orders/[id]/page.tsx>)                               | `/[locale]/orders/[id]`                | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/orders/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/orders/page.tsx>)                                         | `/[locale]/orders`                     | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/(dashboard)/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/page.tsx>)                                                       | `/[locale]`                            | `/[locale]/back-office` / `CatalogManager.tsx` — partial catalog/inventory flow |
| [[locale]/(dashboard)/products/[id]/edit/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/products/[id]/edit/page.tsx>)                 | `/[locale]/products/[id]/edit`         | `/[locale]/back-office` / `CatalogManager.tsx` — partial catalog/inventory flow |
| [[locale]/(dashboard)/products/[id]/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/products/[id]/page.tsx>)                           | `/[locale]/products/[id]`              | `/[locale]/back-office` / `CatalogManager.tsx` — partial catalog/inventory flow |
| [[locale]/(dashboard)/products/new/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/products/new/page.tsx>)                             | `/[locale]/products/new`               | `/[locale]/back-office` / `CatalogManager.tsx` — partial catalog/inventory flow |
| [[locale]/(dashboard)/products/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/products/page.tsx>)                                     | `/[locale]/products`                   | `/[locale]/back-office` / `CatalogManager.tsx` — partial catalog/inventory flow |
| [[locale]/(dashboard)/users/page.tsx](<../frontend/dashboard/src/app/[locale]/(dashboard)/users/page.tsx>)                                           | `/[locale]/users`                      | No dedicated target page; preserve for Back Office migration                    |
| [[locale]/login/page.tsx](../frontend/dashboard/src/app/[locale]/login/page.tsx)                                                                     | `/[locale]/login`                      | `/[locale]/back-office/sign-in` — target sign-in; visual parity pending         |

## Completion evidence required for each migrated slice

- The original capability and content have a working target equivalent, including
  navigation links and any old URL redirect; deviations are recorded and approved.
- Theme and layout comparisons cover light/dark, Arabic/English, and mobile/desktop.
  Review keyboard/focus behavior, form labels/errors, and loading/empty/error states.
- The existing target authorization and data guarantees remain intact. Add focused
  behavior/browser coverage for migrated flows, not tests asserting source files exist.
- Record the comparison evidence and user acceptance here before changing a row
  to complete or deleting its reference implementation.

Current quality, security, and architecture checks protect the supported target
runtime. They do not certify the archived apps as runnable or establish full visual
parity. Production certification and deployment remain the separate #89 phase.
