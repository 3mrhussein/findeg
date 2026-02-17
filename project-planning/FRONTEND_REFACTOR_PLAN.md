# Frontend Refactor Plan (Next.js 16 + shadcn)

Last updated: 2026-02-17

## Goal
Deliver a static-first storefront and cleaner component architecture by using Next.js 16 cache primitives and isolating client interactivity to focused islands.

## Principles
- Server-first rendering for public content pages.
- Use `'use cache'`, `cacheTag`, and `cacheLife` for read models.
- Invalidate cache by tags from admin mutations.
- Use shadcn primitives for consistent UI composition.
- Keep presentational components pure; move data/logic to server queries and container layers.

## Workstreams

### G1. Storefront Data Layer (Server Queries)
- [x] Add cached storefront query module (`features/catalog/application/queries/storefront.ts`)
- [x] Add central cache tags (`features/core/domain/constants/cache-tags.ts`)
- [x] Home data query (featured products + categories)
- [x] Shop list data query
- [x] Categories list data query
- [x] Product detail data query
- [x] Search data query

### G2. Static-First Rendering
- [x] Home route static-first (`force-static`)
- [x] Shop route static-first (`force-static`)
- [x] Categories route static-first (`force-static`)
- [x] Product detail static params from DB-backed query
- [x] Product detail route static-first (`force-static`)
- [x] Add per-page metadata generation for SEO pages

### G3. Cache Invalidation Integration
- [x] Product admin actions invalidate `catalog:products`
- [x] Category admin actions invalidate `catalog:categories` + `catalog:products`
- [x] Brand admin actions invalidate `catalog:brands` + `catalog:products`
- [x] Inventory actions invalidate `catalog:products`
- [ ] Invalidate review tag after review mutations are wired

### G4. Component Structure Refactor
- [x] Remove duplicated shop/local ProductCard implementation via shared re-export
- [x] Remove duplicated shop/local ProductListItem implementation via shared re-export
- [x] Product detail template now presentational with server-provided props
- [x] Categories template now presentational with server-provided props
- [x] Search template now presentational with server-provided props
- [x] Split `ShopContent` into controller (`useShopContentController`) and pure view (`ShopContentView`)
- [x] Split storefront header into controller (`useHeaderController`) and pure view (`HeaderView`)
- [x] Split `ProductActions` into controller (`useProductActionsController`) and pure view (`ProductActionsView`)
- [x] Split `ProductReviews` into controller (`useProductReviewsController`) and pure view (`ProductReviewsView`)
- [x] Split `ProductCard` interaction logic into controller hook (`useProductCardController`)
- [x] Split `ProductListItem` interaction logic into controller hook (`useProductListItemController`)
- [x] Split `CheckoutContent` into controller (`useCheckoutContentController`) and pure view (`CheckoutContentView`)
- [x] Split `ReviewForm` into controller (`useReviewFormController`) and pure view (`ReviewFormView`)
- [x] Add shared storefront view-model contracts (`ProductCardControllerVM`, `ProductListItemControllerVM`, `HeaderControllerVM`)
- [x] Add shared storefront handler contracts (`ProductActionHandlers`, `HeaderActionHandlers`)
- [x] Add shared default variant-selection hook (`useDefaultVariantSelection`)
- [x] Remove route-level duplicate aliases for shared ProductCard/ProductListItem/CartDrawer
- [ ] Move remaining route-level duplicated UI fragments to shared feature UI

### G5. Client Island Reduction
- [x] Keep filtering/sorting UI in `ShopContent` client island
- [x] Move list data fetch to server and pass products into client island
- [x] Reduce shell orchestration complexity by isolating header logic in controller hook
- [ ] Audit and remove unnecessary `use client` from non-interactive components
- [ ] Split large client components into pure presentational + hook/controller

### G6. UX Consistency (shadcn-first)
- [ ] Replace remaining ad hoc containers with shadcn `Card`, `Alert`, `Skeleton`, `Empty` patterns
- [x] Add reusable state components under `components/common/state/*`
- [x] Standardize loading/empty/error states on shop/search/categories/product/checkout pages
- [x] Standardize interaction feedback (toasts/buttons/spinners/disabled states) for cart/review actions
- [x] Mobile pass (spacing and tap-target updates) for header/menu/filter/cart controls
- [x] Mobile pass (sticky actions and final responsive polish) across product/checkout screens
- [x] Replace custom mobile menu shell with shadcn `Sheet`
- [x] Replace custom cart drawer shell with shadcn `Sheet`
- [x] Remove legacy custom filter modal implementation and keep dialog-based filter UX

### G7. Storefront-First IA + School Secondary Flow
- [x] Update navigation to storefront-first ordering (Shop/Search/Categories primary)
- [x] Add secondary school list entry in header and mobile menu
- [x] Add optional school-list route (`/school-lists`) as assistive utility flow
- [x] Add homepage secondary CTA for school-list lookup
- [x] Keep single brand identity while updating logo/theme/brand-kit

## Progress Summary
- Storefront now uses a cached server query layer for core pages.
- Major public pages are static-first where possible.
- Admin mutations now invalidate storefront cache tags.
- Duplicated card/list component implementations have been consolidated.
- Route-level localized metadata is now generated for home/shop/categories/product/search.
- Storefront core now uses shared page/section state patterns.
- Header and shop listing logic have been separated into controller/view layers.
- School-list flow is integrated as a secondary utility without changing primary storefront IA.
- Header/menu/product interaction readability was improved by extracting handlers into focused hooks.
- Duplicate storefront alias files were removed to keep a single source of truth for shared UI.
- Current priority is client-island audit and final storefront UAT checklist pass.

## Storefront Readability Standards
- No inline business handlers in top-level JSX; use `useXController` hooks.
- Keep presentational components render-focused and side-effect free.
- Prefer shadcn primitives (`Sheet`, `Dialog`, `DropdownMenu`) over custom modal/drawer shells.
- Avoid `as any` in storefront UI modules.

## Component Mapping (Cleanup)
- Removed: `src/app/[locale]/(shop)/_components/ProductCard.tsx`
  Replacement: `src/components/common/ProductCard.tsx`
- Removed: `src/app/[locale]/(shop)/_components/ProductListItem.tsx`
  Replacement: `src/components/common/ProductListItem.tsx`
- Removed: `src/app/[locale]/(shop)/_components/CartDrawer.tsx`
  Replacement: `src/components/common/CartDrawer.tsx`
- Removed: `src/app/[locale]/(shop)/shop/FilterModal.tsx`
  Replacement: dialog-based filtering in `src/app/[locale]/(shop)/shop/ShopContentView.tsx`

## Next Tasks
1. Execute manual UI/UAT checklist and produce fix backlog.
2. Review non-critical route shells (`about`, `brand-kit`) for the same feedback/state consistency patterns.
3. Run final storefront accessibility pass (focus order, keyboard nav, ARIA semantics).
