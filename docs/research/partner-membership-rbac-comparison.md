# Partner Membership / Partner Roles: `develop`'s fresh model vs. extending `main`'s RBAC

Date: 2026-09-18

Related: [issue #148](https://github.com/3mrhussein/findeg/issues/148) (child of [#146](https://github.com/3mrhussein/findeg/issues/146)), [PR #73](https://github.com/3mrhussein/findeg/pull/73), [issue #56](https://github.com/3mrhussein/findeg/issues/56), [issue #50](https://github.com/3mrhussein/findeg/issues/50) (stories 18-20)

> Note on location: this repo has `docs/adr/`, `docs/architecture/`, `docs/development/`, `docs/guides/`, `docs/agents/`, but no existing directory for exploratory/comparison research notes. `docs/adr/` is for decisions already made, not for a pre-decision comparison. This file is placed at `docs/research/` as a new convention, per the task instructions, since none of the existing directories fit.

## Sources consulted

- `develop` branch, tip commit `501ee3b1` (confirmed identical locally and via `origin/develop`) — read via `git show develop:<path>`, no checkout performed.
- PR #73 ("Manage scoped Partner Memberships and Workspace context"), merged, `+7451/-50`, via `gh pr view 73` / `gh pr diff 73 --name-only`.
- Issue #56 and issue #50 (stories 18-20) referenced by PR #73's description ("Implements #56, part of #50"); PR body itself was the primary source used for narrative context.
- `main`-based working branch (this worktree, currently on `worktree-agent-ae6be3af80f78fbb9`, based on `main`) — read directly via `Read`/`grep` against the checked-out tree. No branch switch was needed since this worktree already sits on the `main` lineage; `git status` was clean before and remains clean after this research (only this new file was added).

## Axis 1 — Schema shape

### `develop`'s approach (fresh model, PR #73)

New `identity` schema tables, purpose-built for partner workspaces:

- `db/src/modules/partner-management/schema.ts:19-33` — `businessPartners` (`id`, `code` unique, `nameEn`/`nameAr`, `status` enum-by-check `onboarding|active|suspended|closed`, `authorizationVersion` integer counter for cache-busting sessions).
- `db/src/modules/partner-management/schema.ts:35-61` — `partnerInvitations` (`businessPartnerId` FK, `email`, `roles text[]` with a CHECK constraining to a fixed additive role set `partner-administrator|list-manager|collection-staff|report-viewer`, `tokenDigest` unique, `inviterId` FK, `expiresAt`, `status` enum `pending|accepted|revoked`, plus a **partial unique index** `one_pending_partner_invitation` on `(businessPartnerId, email) WHERE status = 'pending'`).
- `db/src/modules/partner-management/schema.ts:63-86` — `partnerMemberships` (`businessPartnerId` FK, `userId` FK, `invitationId` FK **unique** — 1:1 membership-per-invitation, `roles text[]` with the same fixed-set CHECK, `status` enum `active|suspended|ended`, `authorizationVersion` integer, and a **partial unique index** `one_current_partner_membership` on `(businessPartnerId, userId) WHERE status <> 'ended'`).
- `db/src/modules/partner-management/schema.ts:88-97` — `partnerAccessHistory` (append-only audit log: `businessPartnerId`, `actorId`, `action`, `before`/`after` jsonb, `createdAt`).
- Migration: `db/migrations/0003_partner_memberships.sql:1-45` creates all four tables plus FKs and the two partial unique indexes in one migration.

Roles are stored as a denormalized `text[]` column directly on the invitation/membership row (not a join table), constrained by a hardcoded 4-value CHECK — cheap to query but requires a new migration to add a role.

### `main`'s approach if extended (existing RBAC + new `PartnerMembership` layer)

`main` already has a normalized RBAC schema in `db/src/schema/identity/identity-access.ts`, created by `db/migrations/0000_little_chimera.sql`:

- `db/src/schema/identity/identity-access.ts:80-90` — `roles` (`id`, `code` typed as `RoleId` = `z.string().min(1)`, `name`).
- `db/src/schema/identity/identity-access.ts:95-108` — `permissions` (`id`, `code` typed as `PermissionCode`, regex-validated `dot.separated` format).
- `db/src/schema/identity/identity-access.ts:113-125` — `rolePermissions` (join table, composite PK).
- `db/src/schema/identity/identity-access.ts:130-155` — `userRoles`: `userId`, `roleId`, `scope` (`RoleScope` = `'global' | 'organization'`, `db/src/types/identity.ts:103-104`), `organizationId` (nullable FK, required only when `scope === 'organization'`), unique on `(userId, roleId, scope, organizationId)`.
- `db/src/schema/identity/identity-access.ts:61-75` — `organizations` (`id`, `code`, `name`, `isActive`) — already the tenant/workspace concept.
- `db/src/schema/identity/identity-access.ts:183-201` — `organizationMemberships` (`organizationId`, `userId`, `status` varchar defaulting `'active'`, unique on `(organizationId, userId)`) — **this already covers most of what `partnerMemberships` does**, but: no `roles` column (roles live separately via `userRoles` scoped rows, not attached to the membership row), status values only documented as `'active'|'invited'|'suspended'` via the Zod type `OrganizationMembershipStatusSchema` (`db/src/types/identity.ts:235-236`) — **no `'ended'` terminal state exists yet**, and there is no partial-unique "one active membership" guard (only a plain unique on org+user, which does not distinguish ended vs. active memberships the way `develop`'s partial index does).
- No `partner_invitations`-equivalent table exists on `main` at all — no invitation/token schema, no `RoleGrant`-to-invitation linkage. `db/src/types/identity.ts:217-244` already has `RoleGrantSchema` and `OrganizationMembershipSchema` (pure Zod types, not yet backed by matching DB columns for roleGrants-on-membership) that a `PartnerMembership` layer would need to either adopt or reconcile with.

To extend `main`, approach B would need to: (a) add an invitations table (new), (b) either add a `roles`/`roleGrants` column to `organizationMemberships` or continue projecting roles from `userRoles` rows scoped to that organization, and (c) add an `'ended'` status value plus a partial unique index mirroring `develop`'s concurrency guard — none of which exist today.

## Axis 2 — Invitation / acceptance flow

### `develop`'s approach

- Issuance: `backend/src/modules/partner-management/public.ts` `invite()` (~lines 233-259) validates the actor via `manage()` (site-admin-or-workspace-admin gate, lines 108-121), validates partner status is `active|onboarding`, validates email format and role set, generates a random token (`security.newToken()`), stores only its digest (`security.digest(token)`), and calls `store.issueInvitation(...)`.
- `db …/infrastructure/persistence.ts:90-105` `issueInvitation` — in the same call, atomically revokes any existing `pending` invitation for that `(businessPartnerId, email)` pair (via UPDATE ... RETURNING) before inserting the new one, so re-inviting can't create two pending invitations (also backstopped by the partial unique index).
- Acceptance: `public.ts` `acceptInvitation()` (~lines 261-286) re-derives the session, checks token found + `status === 'pending'` + not expired + session email (case/whitespace-normalized) matches invitation email, locks the partner row (`store.lockPartner`, which does `SELECT ... FOR UPDATE` — `persistence.ts:47-53`), checks the partner is still `active|onboarding`, checks the user doesn't already have a non-ended membership for that partner, then calls `store.acceptInvitation`.
- `persistence.ts:135-149` `acceptInvitation` — inserts the `partnerMemberships` row and flips the invitation to `accepted` inside the same transaction (both statements share the caller's transaction; the `invitation()` lookup at `persistence.ts:107-124` also does a `SELECT ... FOR UPDATE` on the invitation row itself before returning it, serializing acceptance against issuance).
- A signed-out recipient can sign in on the acceptance page without losing the invitation token (per PR #73 description) — the frontend route `frontend/web/src/app/[locale]/partner/invitations/accept/page.tsx` and API route `frontend/web/src/app/api/v1/partner/invitations/accept/route.ts` (both listed in the PR diff) carry the token through the auth redirect.

### `main`'s approach if extended

No invitation/acceptance flow exists at all on `main`. There is no `RoleGrant`-issuing or token-based invite mechanism anywhere under `backend/src/features/identity` or `db/src/queries/identity/*` (confirmed by `grep -rn "invitation" db/src backend/src/features/identity` returning no hits). Building this on top of `organizationMemberships` would mean designing from scratch: a token/digest table, an issuance service method, and an acceptance service method that inserts into `organizationMemberships` (currently only reachable via whatever direct-insert path exists — none of the current `AdminRoleService`/`PermissionService`/`UserService` files expose a membership-creation API). This is a bigger net-new surface for approach B on this specific axis, even though the underlying membership table already exists.

## Axis 3 — Final-administrator protection

### `develop`'s approach

- `public.ts` `updateMembership()` (~lines 158-192): before demoting/suspending/ending a member who is currently an active `partner-administrator`, it recomputes `removesAdministrator` and checks whether any *other* active membership on that partner still holds `partner-administrator`; if not (and the partner itself is `active`), it returns `{ status: 'last-administrator' }` instead of applying the change (lines 176-192).
- `public.ts` `changePartnerStatus()` (~lines 216-232): when transitioning a partner's status to `'active'`, it requires at least one active membership with `partner-administrator` role to already exist, else returns `last-administrator` (lines 224-231) — this guards the "reactivate with zero admins" case, complementing `updateMembership`'s guard for the "demote the last admin" case.
- Both checks read the full membership list within the same locked-partner transaction (`store.lockPartner` takes the row lock first in both call chains via `manage()`), so the check-then-act sequence is protected against concurrent membership changes on the same partner.

### `main`'s approach if extended

No equivalent exists. `grep -rn "last.admin|finalAdmin" backend/src db/src` returns nothing, and `AdminRoleService` (`backend/src/features/identity/application/services/AdminRoleService.ts`) only tracks role/permission CRUD and per-role user counts (`getRoleUserCountRaw`, referenced at line ~15) — it has no concept of "the last admin of a scoped organization" because `userRoles`' `scope`/`organizationId` columns exist, but no service currently queries "count of users with role X scoped to organization Y" to gate a demotion. Approach B would need to write this guard from scratch, most naturally as a check against `userRoles` filtered by `scope = 'organization' AND organizationId = :id AND roleId = :adminRoleId`, executed under a row lock on the `organizations` (or a new `PartnerMembership`) row to avoid races — analogous to, but not reusing, `develop`'s logic since the data shape differs (join-table role grants vs. a `roles text[]` column).

## Axis 4 — Concurrent-replay safety (e.g., double-accept)

### `develop`'s approach

- Row-level locking: `persistence.ts` `lockPartner()` (lines 47-53) does `SELECT ... FOR UPDATE` on the `businessPartners` row; `persistence.ts` `invitation()` (lines 107-124) does two `FOR UPDATE`s in sequence — first locks the partner row, then locks the specific invitation row — before returning invitation data to the caller. This means two concurrent `acceptInvitation` calls for the same invitation serialize on the partner-row lock (the second waits, then re-reads and sees `status !== 'pending'`, returning `invitation-unavailable`).
- Database constraints as a second line of defense: `partner_memberships_invitation_id_unique` (schema.ts:71-73, migration 0003 line ~30) prevents two memberships ever being created from the same invitation even if the application-level lock were bypassed; the partial unique index `one_current_partner_membership` (schema.ts:83-85) prevents a user from ending up with two simultaneous non-ended memberships on the same partner.
- Explicitly called out in the PR #73 description: "expiry, revocation, resends, and concurrent replay cannot create duplicate access," and the PR's validation notes list dedicated tests for "single-use acceptance ... concurrent replay" (see `tests/partner-memberships.test.mjs`, listed in the PR diff).

### `main`'s approach if extended

No comparable transactional/locking pattern exists for membership creation because no membership-creation flow exists yet. The only unique constraint relevant today is `uq_organization_memberships_org_user` (`identity-access.ts:198`, a plain unique on `(organizationId, userId)` with no partial `WHERE status <> 'ended'` clause) — since there's no `'ended'` status value in the current Zod enum (`OrganizationMembershipStatusSchema`, `db/src/types/identity.ts:235`), the plain unique constraint would already block a user from ever re-joining a workspace they'd previously left, unless approach B first adds an `'ended'`-equivalent status and a matching partial index (mirroring `develop`'s `one_current_partner_membership`). Row-locking discipline (`SELECT ... FOR UPDATE` on the organization or the new invitation row before accept) would also need to be added from scratch; nothing in `db/src/queries/identity/*` currently takes such a lock.

## Tradeoffs summary

| Axis | `develop` (fresh model) | Extend `main` (layer on existing RBAC) |
|---|---|---|
| Schema shape | 4 new purpose-built tables, roles denormalized as `text[]` + CHECK; ships in one migration (`0003`) | Reuses existing `organizations`/`organizationMemberships`; needs a new invitations table, an `'ended'` status, and a decision on where roles live (column vs. continuing to use `userRoles` join rows) — schema work is smaller in table count but touches an existing, presumably-live table |
| Invitation/acceptance | Fully built, tested, deployed (PR #73); token digest, single-pending-per-email, sign-in-preserves-token UX | Nothing exists; full flow (token issuance, digest storage, acceptance service, frontend routes) must be designed and built new |
| Final-admin protection | Two explicit guards (`updateMembership`, `changePartnerStatus`) proven in production | Nothing exists; must be designed against the join-table role shape (`userRoles` scoped rows), which is a different (arguably more normalized but more query-heavy) check than `develop`'s array-membership check |
| Concurrent-replay safety | `FOR UPDATE` locking + two unique constraints (one plain, one partial), covered by dedicated concurrency tests | No locking pattern or partial-unique-index precedent in the codebase yet for this kind of flow; would need to be introduced from scratch, and the existing plain unique constraint on `organizationMemberships` would need to become a partial index once an `'ended'` state is introduced |

**What this means for the decision:** `develop`'s implementation is a complete, tested, already-merged reference for all four axes — reusing its design (even if not its code, per instructions) would be the fastest path to something battle-tested. Extending `main`'s RBAC reuses more existing infrastructure at the schema level (organizations, organization memberships, scoped role grants already partially modeled in `db/src/types/identity.ts`) and would fold partner workspaces into the same normalized role/permission model as staff RBAC — likely a cleaner long-term model with one unified permission system instead of two parallel ones (`develop`'s fixed 4-role array vs. `main`'s open-ended `roles`/`permissions` tables) — but essentially all of the invitation flow, final-admin protection, and concurrency safety net would need to be designed and built new, and validated with the same rigor `develop` already went through (real-Postgres concurrency tests, migration replay tests, audit history). The concrete question to resolve before choosing: is a single unified RBAC model (staff + partner) worth re-deriving and re-testing invitation/acceptance, final-admin, and concurrency logic that `develop` has already shipped and proven — or is it acceptable to keep partner RBAC as a parallel, simpler, purpose-built system (`develop`'s shape) even after `main` absorbs `develop`'s other changes?
