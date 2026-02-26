# Missing Flows / Pages Matrix

Last updated: 2026-02-18

## Storefront (Buyer)

| Route / Flow | Status | Current State | Gap / Missing Use Case | Priority |
| --- | --- | --- | --- | --- |
| `/` (Home) | Partial | Core sections work with data | Header links still point to legacy routes (`/shop`, `/categories`, `/search`) | High |
| `/products/[slug]` | Partial | Product details page wired to services | Needs related products/recommendations + deep-link robustness | Medium |
| `/categories/[slug]` | Partial | Category products list works | Filter UI still mock-driven in sidebar | High |
| `/checkout` | Partial | Checkout API flow implemented | Needs signed-in user prefill + stronger field validation UX | Medium |
| `/school` | Partial | UI exists | Uses mock school/grade/list data; no real lookup flow | High |
| `/shop` | Partial | Route implemented with full product listing | Needs filter/sort parity with category view | High |
| `/categories` | Partial | Category index/landing route implemented | Needs richer merchandising blocks and counts | Medium |
| `/search` | Partial | Search page route implemented with query input + results | Needs advanced facets/sort and typo-tolerance UX | High |
| `/school-lists` | Partial | Alias route implemented (redirect to `/school`) | Needs final decision whether alias remains or dedicated page returns | Medium |
| `/about` | Missing | Footer/Nav copy exists | No about page route | Medium |

## Identity / Account

| Route / Flow | Status | Current State | Gap / Missing Use Case | Priority |
| --- | --- | --- | --- | --- |
| `/registration` | Partial | Registration UI exists | Confirm server action error and success UX consistency | Medium |
| `/admin-login` | Partial | Login form exists | Mixed localization + no explicit error boundary UX | Medium |
| `/my-account` | Partial | Page/template exists | Needs concrete profile/address/order-history workflows | High |

## Identity / RBAC Platform Flows

| Route / Flow | Status | Current State | Gap / Missing Use Case | Priority |
| --- | --- | --- | --- | --- |
| Linked auth accounts | Missing | Single account assumptions in auth model | Add provider-linked accounts per user with deterministic merge rules | High |
| Password credential lifecycle | Partial | Password hashing exists in basic user model | Split credential store and add hash strategy metadata + rotation path | High |
| Permission guard enforcement | Missing | Some direct role checks still exist | Replace route/API checks with permission-code guards | High |
| Organization memberships | Missing | No scoped organization membership model | Add org + membership + scoped role grants for business users | High |
| Guest principal lifecycle | Partial | Guest checkout/cart behavior exists | Persist guest principal model and support upgrade/merge into user identity | Medium |
| Saved payment methods | Missing | Checkout supports submission but no tokenized vault model | Add payment token entity + ownership and lifecycle policy | Medium |

## Admin

| Route / Flow | Status | Current State | Gap / Missing Use Case | Priority |
| --- | --- | --- | --- | --- |
| `/admin/products` | Partial | List/create/edit/delete now wired | Add bulk actions and stronger validation feedback loops | Medium |
| `/admin/categories` | Partial | CRUD table/forms wired | Add parent-cycle guard and clearer hierarchy warnings | Medium |
| `/admin/brands` | Partial | Modal CRUD wired | Add upload/selection for brand media and better search/filter | Low |
| `/admin/orders` | Done | Status + payment operations, transition constraints, filters, pagination, and detail links are wired | Optional next step: bulk operations and saved filter presets | Low |
| `/admin/orders/[id]` | Done | Detail page includes status/tracking/notes operations + transition rules + inline audit timeline | Optional next step: richer shipment/return workflow actions | Medium |
| `/admin/inventory` | Partial | Stock edit + search/low-stock filter/sort + batch adjustments implemented | Missing server-side pagination/filter APIs for large catalogs | Medium |
| `/admin/media` | Done | Upload + list + delete + select/copy URL flows are wired through media service/API | Optional next step: bulk-delete and usage references before delete | Medium |
| `/admin/audit-log` | Done | Filterable + traceable links implemented | Optional export/download flow is still missing | Low |

## Cross-Cutting Use Cases (Missing)

| Use Case | Status | Gap | Priority |
| --- | --- | --- | --- |
| Canonical storefront navigation | Missing | Header/footer routes are not aligned with actual route tree | High |
| Search + category discovery | Missing | No dedicated search/index category pages | High |
| School list import-to-cart | Missing | No end-to-end lookup and cart injection with real service data | High |
| Logged-in checkout acceleration | Missing | No profile/address prefill path | Medium |
| Buyer order history/account management | Partial | Templates present but no complete operational flow | High |
| Permission-scoped admin operations | Missing | Admin access is role-centric | Transition to permission-based entitlement checks per operation | High |

## Suggested Delivery Order

1. Canonical route alignment (`/shop`, `/categories`, `/search`, `/school-lists`) and nav fixes.
2. School list real service flow + add-to-cart.
3. Buyer account/order history use cases.
4. Admin media + order-detail operational controls.
