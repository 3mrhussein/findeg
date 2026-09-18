---
status: proposed
---

# Model Partner Workspace membership as a parallel `PartnerMembership` concept, not unified RBAC

`main`'s `identity` feature has a Staff RBAC model (`RoleId`/`RoleScope`/`PermissionCode`, `organizations`/`organizationMemberships`/`userRoles`) with schema bones that could plausibly host Business Partner membership too, but has zero invitation flow, zero final-administrator protection, and zero concurrency-safety pattern for membership changes. `develop`'s PR #73 implements exactly this for Partner Membership — tested, production-proven, but as a fully separate model alongside Staff RBAC rather than layered onto it (research: [`docs/research/partner-membership-rbac-comparison.md`](https://github.com/3mrhussein/findeg/tree/research/partner-membership-rbac)).

We adopt develop's shape as a parallel `PartnerMembership` concept, not a unification with Staff RBAC. Partners are customer-like surfaces (per this map's Notes), and unifying would mean re-deriving and re-validating three non-trivial correctness properties (invitation/acceptance, final-admin protection, concurrent-replay safety) from zero, for a payoff — one RBAC model instead of two — that is organizational tidiness, not user-facing value.

## Decision

- **Schema**: four tables, mined from develop's shape (`db/migrations/0003_partner_memberships.sql`, `db/src/modules/partner-management/schema.ts`) and re-created fresh under main's `identity` schema, not ported verbatim:
  - `business_partners` — the workspace/tenant row.
  - `partner_invitations` — `roles: text[]` (CHECK-constrained), `tokenDigest`, `expiresAt`, `status: pending|accepted|revoked`, partial unique index enforcing one pending invitation per (business partner, email).
  - `partner_memberships` — `roles: text[]` (CHECK-constrained), `status: active|suspended|ended`, `authorizationVersion: integer` (see below), partial unique index enforcing one current (non-`ended`) membership per (business partner, user).
  - `partner_access_history` — audit trail for membership/role changes, ahead of the Rewards/Reports surfaces that will want one.
- **Roles**: reuse develop's fixed, additive 4-role set as-is — `partner-administrator`, `list-manager`, `collection-staff`, `report-viewer` — CHECK-constrained on both `partner_invitations.roles` and `partner_memberships.roles`. Kept fully separate from Staff Roles (`RoleId`/`PermissionCode`); no shared enum, no shared table.
- **Permission checks**: Partner Workspace routes/handlers check the `roles` array directly (e.g. `membership.roles.includes('list-manager')`), independent of `PermissionService`/`AdminRoleService`. Routing Partner checks through the Staff permission system would recreate the coupling this ADR rejects; a closed 4-role array doesn't need a general permission-code system.
- **Invitation/acceptance, final-administrator protection, concurrency safety**: adopt develop's mechanisms as-is — token-digest storage for invitations, explicit final-administrator guards on membership update and partner status change, `SELECT ... FOR UPDATE` row locking plus the two unique constraints above for concurrent-replay safety. These are proven and tested in develop; there's no reason to redesign a correctness-critical mechanism that already works.
- **`authorizationVersion`**: carried over on `partner_memberships` as a per-membership counter, bumped on role/status change. This mirrors main's existing pattern — `users.authorizationVersion` is already baked into the session token (`buildCurrentSessionPayload.ts`) to invalidate stale sessions — but stays scoped to the membership, so bumping it revokes only that partner's stale role grant, not the user's whole session.
- **Active Business Partner selection**: a route-segment param in `frontend/storefront` (`/partner/[partnerId]/...`), not a request header/cookie or server-side session state. The backend validates on every request that the authenticated user has an active `PartnerMembership` for that `partnerId`. This keeps the "active partner" context stateless and bookmarkable/shareable, and avoids building the fuller multi-portal-session model this map's Not-yet-specified section already flagged as premature.

## Considered options

- **Unify into main's `organizations`/`organizationMemberships`/`userRoles`** — one RBAC model for Staff and Partners, but requires building invitation flow, final-admin protection, and concurrency safety from zero against an unproven join-table role shape. Rejected: no user-facing payoff for the cost, and Partners are conceptually distinct from Staff.
- **Route Partner Role checks through `PermissionService`** — one authorization code path for the whole app. Rejected: reintroduces the coupling the parallel-model decision just avoided, for a 4-role closed set that doesn't need general permission-code machinery.
- **Session/cookie-based active-partner context instead of a route param** — fewer URL segments. Rejected: makes the active-partner context invisible to the URL (not bookmarkable/shareable) and edges toward the fuller multi-portal-session model this map has explicitly deferred.

## Consequences

- Two independent authorization code paths now exist in the codebase (Staff via `PermissionService`, Partner via direct role-array checks). Anyone adding a new Partner-facing surface must remember to check `PartnerMembership.roles` directly, not reach for `PermissionService`.
- `partner_access_history` has no consumer yet; it's added ahead of need for the Partner Reports ticket (still in this map's Not-yet-specified), on the expectation that an audit trail is cheaper to add now than to retrofit once Rewards/Reports exist.
- The vocabulary rename (Parent/School → Customer/Partner School/...) is out of scope for this ADR — it applies to the School Supply List domain, not Partner Workspace/Membership, and is tracked on ticket #150.
