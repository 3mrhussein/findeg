# Frontend Use Case Backlog

Last updated: 2026-02-17

## P0: Route and Navigation Canonicalization

1. **UC-001: Buyer can navigate only to valid storefront pages**
- Scope: Header/footer links + CTA links.
- Status: In progress (core routes and canonical nav links implemented).
- Done when:
  - no links target missing routes (`/shop`, `/categories`, `/search`, `/school-lists`) unless routes are implemented.
  - each top-level nav item resolves to a working page.

2. **UC-002: Buyer can discover products by search and categories index**
- Scope: `/search` + `/categories` index route.
- Status: In progress (routes implemented, additional depth pending).
- Done when:
  - search route supports `?q=` and empty/error/loading states.
  - category index route lists all categories and links to `/categories/[slug]`.

## P0: School List End-to-End

3. **UC-003: Buyer can lookup school list and add bundle to cart**
- Scope: `/school` flow.
- Done when:
  - data source is real service/API (not static mock arrays).
  - user can add selected/all required items to cart.
  - failed lookup and missing list states are handled.
- Reference:
  - `docs/features/SCHOOL_LIST_PRIVATE_ACCESS_FEATURE_SPEC.md`

## P1: Buyer Account and Checkout Enhancement

4. **UC-004: Signed-in buyer gets checkout prefill**
- Scope: `/checkout`.
- Done when:
  - profile/address defaults prefill checkout form.
  - user can still override values before placing order.

5. **UC-005: Buyer can view account profile and order history**
- Scope: `/my-account`.
- Status: Implemented (server-backed profile + update action + order history/detail links).
- Done when:
  - profile section with update action works.
  - order list links to order details.

## P1: Admin Operational Gaps

6. **UC-006: Admin manages media assets with selection and cleanup**
- Scope: `/admin/media`.
- Status: Done (upload/list/delete/select/copy URL flows implemented).
- Done when:
  - upload, list, delete actions are fully wired.
  - media can be selected/copied for product/brand forms.

7. **UC-007: Admin performs order operations from order detail**
- Scope: `/admin/orders/[id]`.
- Status: Done (status/tracking/internal notes + transition rules + inline audit timeline implemented).
- Done when:
  - status/tracking actions are available in detail page.
  - state changes show feedback and refresh reliably.
  - audit log entries are visible for those changes.

## P2: Quality Expansion

8. **UC-008: Critical buyer/admin journeys are covered by smoke E2E**
- Scope: test suite + CI.
- Done when:
  - key flows (browse -> cart -> checkout, admin product CRUD, order status update) have smoke tests.

9. **UC-009: Core storefront routes have performance/a11y checks**
- Scope: automated checks.
- Done when:
  - checks run in CI for home, product detail, checkout routes.
