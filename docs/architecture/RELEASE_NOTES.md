# Architecture Release Notes

This file captures major architecture-level changes that are too important to rely on commit history grouping alone.

## Update Policy

- Update this file for any major change in:
  - database schema shape
  - domain model/value objects
  - authentication/authorization model
  - API contracts that affect multiple features
- Keep entries short, decision-focused, and date-stamped.
- Treat this file as additive and append-only for release chronology.

## Unreleased

### 2026-02-19 - Localized Catalog Contract Rollout (Incremental)

- Extended catalog query behavior to use localized JSONB fields in search/filter paths:
  - product localized slug/name/description/long-description
  - category and brand localized names in search matching
- Added locale-aware brand mapping and locale slug lookup in brand repository:
  - `getBySlug(slug, language?)` now supports localized slug resolution
  - domain `Brand.slug/name` now resolve by requested locale with localized-content fallback
- Corrected search fallback mode semantics:
  - strict miss + fuzzy miss now returns `mode="empty"` instead of misclassifying as exact

### 2026-02-19 - Permission-Aware Session Cutover (Incremental)

- Reused permission-aware session semantics in additional runtime paths:
  - login redirect path now builds session-like payload and evaluates through shared admin guard
  - order detail access check now uses `isAdminSession` instead of direct role string checks
- Expanded auth result surface with additive session fields (`activeRoleIds`, `permissionCodes`, actor/org context) for progressive cutover compatibility.
- Added required-permission evaluation in API middleware and applied route-level permission codes to admin/media endpoints.
- Middleware permission paths now authorize by required permission code directly, enabling future non-admin scoped roles without route rewrites.
- Auth login session payload now resolves role IDs and permission codes from identity-access RBAC tables (`user_roles`, `role_permissions`, `permissions`) with backward-compatible admin fallback.

### 2026-02-19 - Pricing Resolver Baseline (Computed Strike)

- Added shared pricing resolver in domain value objects:
  - computes `finalPrice` from persisted `pricing` and active `discountRules`
  - computes strike price at runtime (`deriveStrikePrice`) instead of persisting strike
- Wired resolver into:
  - catalog domain product entity (`getResolvedPricing`)
  - product repository domain mapping

### 2026-02-19 - Identity Seed Snapshot Expansion

- Extended CSV seed snapshots to include identity-access/RBAC tables:
  - `roles`, `permissions`, `role_permissions`, `user_roles`
  - `auth_accounts`, `password_credentials`
  - `organizations`, `organization_memberships`
  - `payment_methods`, `guest_principals`
- Updated CSV seeder import/truncate order and made seeding resilient to environments where some target tables are not present yet.
- Synchronized schema artifacts with current runtime model:
  - regenerated `docs/database/SCHEMA.md`
  - aligned `scripts/data/seed/tables/schema-diagram.mmd` with seeded runtime tables

### 2026-02-18 - Schema + DDD Refactor Governance Baseline

- Added execution governance tracker for catalog + identity redesign:
  - `project-planning/SCHEMA_DDD_REFACTOR_TASKS.md`
- Formalized changelog + release-notes dual process:
  - git-derived `CHANGELOG.md` remains primary change feed
  - this file captures major architecture milestones and decisions
- Aligned planning and architecture docs to the approved redesign targets:
  - localized slug/content contracts
  - computed strike pricing from discount rules
  - identity model expansion (linked accounts, credentials, RBAC, org memberships, guest principals, payment tokens)
