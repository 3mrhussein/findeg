# Schema Redesign Target (Catalog + Identity)

Last updated: 2026-02-18

This document describes the approved target schema for the in-progress DDD refactor.

## Scope

- Catalog localization redesign (localized slug/content objects).
- Pricing redesign (`pricing` + `discountRules`, computed strike in `resolvedPricing`).
- Identity redesign (linked accounts, credentials, RBAC, organizations, memberships, guest principals, tokenized payment methods).

## Source of Truth During Transition

- Current runtime schema: `docs/database/SCHEMA.md` (auto-generated from current implementation).
- Target redesign diagram: `scripts/data/seed/tables/schema-diagram.mmd`.

Use this file for planning and migration sequencing until the runtime schema catches up.

## Target Highlights

1. Product model
- localized fields (`localized_name`, `localized_slug`, `localized_description`) are JSONB locale maps.
- `media_set` stores responsive media variants.
- `pricing` and `discount_rules` are persisted.
- `strikePrice` is computed at runtime, not persisted.

2. Identity model
- `users` is profile-centric.
- `auth_accounts` supports multiple linked login providers.
- `password_credentials` stores hash-only credentials.
- RBAC uses `roles`, `permissions`, `role_permissions`, and `user_roles`.
- multi-tenant/business scope via `organizations` + `organization_memberships`.
- guest continuity via `guest_principals` (+ guest sessions/cart ownership).

3. Checkout and payments
- `payment_methods` stores provider token references only.
- order and order-item snapshots persist resolved pricing context used at checkout time.
