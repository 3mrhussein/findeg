# Partner Membership Feature

Business Partners and (in later tickets) who may work inside their Partner Workspace. See
[ADR-0003](../../../../docs/adr/0003-partner-membership-model.md) and the terms in `CONTEXT.md`.

Partner access is a parallel model next to Staff RBAC: this feature never depends on
`PermissionService`; Staff operations take an explicit `StaffActor` and require `partners.manage`.

## Public interface (barrel)

`createPartnerMembershipServices({ db?, clock?, enqueue? })` returns `{ partners, invitations }`.
`clock` (default: system time) makes expiry testable; `enqueue` is the invitation delivery seam
(ADR-0008) and defaults to a no-op until the Outbox exists. `invite` and `resendInvitation` return the
raw `token` so Staff can copy the link; only its SHA-256 digest is stored.

`invitations` (Staff with `partners.manage`, or a partner actor `{ kind: 'partner', userId }` who is an
active Partner Administrator of that partner; allowed while the partner is `onboarding` or `active`).
`invite` returns `already-member` for an email with an active or suspended membership. A partner actor
cannot tell a missing partner or invitation from one it may not touch (`forbidden`); audit rows carry
`actor_kind = partner`:
`invite` (replaces a pending invitation for the same email), `resendInvitation` (same invitation,
expiry reset to 7 days, new token, older tokens stay valid), `revokeInvitation`,
`listPendingInvitations`, and the read-only `getInvitation(token)`.

`partners`:

| Operation                                | Notes                                                                                                                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createPartner(actor, input)`            | New partners start `onboarding`. `code-taken` on a duplicate code.                                                                                                                             |
| `updatePartner(actor, id, ...)`          | Names any time; `code` only while `onboarding` (`code-locked`). A no-op change writes no audit row.                                                                                            |
| `changePartnerStatus(actor, id, status)` | onboarding→active, active→suspended, suspended→active, non-closed→closed; else `invalid-transition`. `active` needs an active Partner Administrator (`last-administrator`). `closed` is final. |
| `allowedStatusChanges(status)`           | The targets `changePartnerStatus` accepts from `status`; the dashboard renders its actions from this.                                                                                          |
| `listPartners` / `getPartner`            | Staff reads.                                                                                                                                                                                   |

All operations return typed results (`{ success: true, data } | { success: false, error }`) and refuse
actors without `partners.manage` (`forbidden`). Each change commits together with its
`partner_access_history` row.

## Partner access check

`memberships.resolvePartnerContext(session, code)` returns `{ partner, membership }` for an active
member, `suspended` for a suspended membership, and `not-found` for no session, an unknown code, no
membership or an ended one. It reads the database on every call, so role and status changes apply on
the member's next request; callers may cache it only per request. `memberships.listActiveMemberships`
backs the `/partner` index and the account menu.

`memberships.requireRole(context, roles, action)` is pure. Action classes: `read` (not when closed),
`reports` (any status), `membership-change` (onboarding, active) and `business` (active only).
It never uses the Staff permission service.

## Adding write paths

Any later operation that changes a Business Partner (status changes, memberships, invitations) must
lock the partner row first (`lockBusinessPartnerById`) and write its `partner_access_history` row in
the same transaction. `code` may only change while `onboarding`; that rule lives in `updatePartner`.

## Tests

Integration tests run against real Postgres through the harness in `src/testing/postgres`:

```bash
pnpm --filter @findeg/backend test:integration
```
