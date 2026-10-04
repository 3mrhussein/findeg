---
status: accepted
---

# Model Partner Workspace membership as a parallel `PartnerMembership` concept, not unified RBAC

`main`'s `identity` feature has a Staff RBAC model (`RoleId`/`RoleScope`/`PermissionCode`, `organizations`/`organizationMemberships`/`userRoles`) with schema bones that could plausibly host Business Partner membership too, but has zero invitation flow, zero final-administrator protection, and zero concurrency-safety pattern for membership changes. `develop`'s PR #73 implements exactly this for Partner Membership — tested, production-proven, but as a fully separate model alongside Staff RBAC rather than layered onto it (the research file lives on branch `research/partner-membership-rbac`, not on main).

We adopt develop's shape as a parallel `PartnerMembership` concept, not a unification with Staff RBAC. Partners are customer-like surfaces (per the Partner Membership spec, #175), and unifying would mean re-deriving and re-validating three non-trivial correctness properties (invitation/acceptance, final-admin protection, concurrent-replay safety) from zero, for a payoff — one RBAC model instead of two — that is organizational tidiness, not user-facing value.

## Decision

- **Schema**: four tables (five after the Amendment), mined from develop's shape (`db/migrations/0003_partner_memberships.sql`, `db/src/modules/partner-management/schema.ts`) and re-created fresh under main's `identity` schema, not ported verbatim:
  - `business_partners` — the workspace/tenant row.
  - `partner_invitations` — `roles: text[]` (CHECK-constrained), `tokenDigest` (superseded: see Amendment), `expiresAt`, `status: pending|accepted|revoked`, partial unique index enforcing one pending invitation per (business partner, email).
  - `partner_memberships` — `roles: text[]` (CHECK-constrained), `status: active|suspended|ended`, `authorizationVersion: integer` (a stale-edit guard: see Amendment), partial unique index enforcing one current (non-`ended`) membership per (business partner, user).
  - `partner_access_history` — audit trail for membership/role changes, ahead of the Rewards/Reports surfaces that will want one.
- **Roles**: reuse develop's fixed, additive 4-role set as-is — `partner-administrator`, `list-manager`, `collection-staff`, `report-viewer` — CHECK-constrained on both `partner_invitations.roles` and `partner_memberships.roles`. Kept fully separate from Staff Roles (`RoleId`/`PermissionCode`); no shared enum, no shared table.
- **Permission checks**: Partner Workspace routes/handlers check the `roles` array directly (e.g. `membership.roles.includes('list-manager')`), independent of `PermissionService`/`AdminRoleService`. Routing Partner checks through the Staff permission system would recreate the coupling this ADR rejects; a closed 4-role array doesn't need a general permission-code system.
- **Invitation/acceptance, final-administrator protection, concurrency safety**: adopt develop's mechanisms as-is — token-digest storage for invitations, explicit final-administrator guards on membership update and partner status change, `SELECT ... FOR UPDATE` row locking plus the two unique constraints above for concurrent-replay safety. These are proven and tested in develop; there's no reason to redesign a correctness-critical mechanism that already works.
- **`authorizationVersion`**: carried over on `partner_memberships` as a per-membership counter, bumped on role/status change. Superseded by the Amendment: it is not a session mechanism, and the comparison with `users.authorizationVersion` no longer applies.
- **Active Business Partner selection**: a route-segment param in `frontend/storefront` (`/partner/[partnerId]/...`; the Amendment changed the segment to `/partner/[code]`), not a request header/cookie or server-side session state. The backend validates on every request that the authenticated user has an active `PartnerMembership` for that partner. This keeps the "active partner" context stateless and bookmarkable/shareable, and avoids building the fuller multi-portal-session model the earlier planning already flagged as premature.

## Amendment: decisions from the Partner Membership spec (#175)

Settling the gaps left open above changes the decision as follows. Where this section and the text above disagree, this section wins.

- **Five tables, not four.** `partner_invitation_tokens` (`invitation_id`, unique `token_digest`, `created_at`) holds the token digests, replacing the single `tokenDigest` column on `partner_invitations`. An invitation can have several valid digests, because every email carrying a secret gets a fresh one (ADR-0008). A token is valid only while its invitation is pending and unexpired. Only digests are stored.
- **`authorizationVersion` is a stale-edit guard, not a session mechanism.** Membership edit forms carry the version they loaded; a mismatch returns `stale-membership`, and every change bumps it. It does not invalidate sessions, because partner access is resolved from the database on every request. The comparison with `users.authorizationVersion` above no longer applies.
- **`code` is the URL segment.** The Partner Workspace lives at `/partner/[code]`, not `/partner/[partnerId]`. `business_partners.code` is unique and can only change while the Business Partner is `onboarding`, so bookmarked links never break after go-live.
- **`school_staff` is removed.** The legacy global portal role granted the Staff admin portal and locked its holder out of the Customer account area. The `portal_role` enum is recreated without it. Partner access comes only from Partner Membership.
- **`ON DELETE RESTRICT` on the membership's user.** Deleting a user can never silently remove a Partner Administrator.
- **`partner_access_history` is append-only and also records Business Partner changes.** A trigger rejects UPDATE and DELETE. Besides invitation and membership actions it records `partner.created`, `partner.status_changed` and `partner.updated` (a change to names or code).

## Considered options

- **Unify into main's `organizations`/`organizationMemberships`/`userRoles`** — one RBAC model for Staff and Partners, but requires building invitation flow, final-admin protection, and concurrency safety from zero against an unproven join-table role shape. Rejected: no user-facing payoff for the cost, and Partners are conceptually distinct from Staff.
- **Route Partner Role checks through `PermissionService`** — one authorization code path for the whole app. Rejected: reintroduces the coupling the parallel-model decision just avoided, for a 4-role closed set that doesn't need general permission-code machinery.
- **Session/cookie-based active-partner context instead of a route param** — fewer URL segments. Rejected: makes the active-partner context invisible to the URL (not bookmarkable/shareable) and edges toward the fuller multi-portal-session model was explicitly deferred.

## Consequences

- Two independent authorization code paths now exist in the codebase (Staff via `PermissionService`, Partner via direct role-array checks). Anyone adding a new Partner-facing surface must remember to check `PartnerMembership.roles` directly, not reach for `PermissionService`.
- `partner_access_history` was added ahead of need for the Partner Reports ticket, expecting it to serve Reports. ADR-0010 reverses that: Reports do not read it, and the table stays a membership audit.
- The vocabulary rename (Parent/School → Customer/Partner School/...) was out of scope for this ADR. It applies to the School Supply List domain and was done in ADR-0004.
