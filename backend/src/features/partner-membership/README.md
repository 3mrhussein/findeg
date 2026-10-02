# Partner Membership Feature

Business Partners and (in later tickets) who may work inside their Partner Workspace. See
[ADR-0003](../../../../docs/adr/0003-partner-membership-model.md) and the terms in `CONTEXT.md`.

Partner access is a parallel model next to Staff RBAC: this feature never depends on
`PermissionService`; Staff operations take an explicit `StaffActor` and require `partners.manage`.

## Public interface (barrel)

`createPartnerMembershipServices({ db?, clock?, enqueue? })` returns `{ partners, invitations, memberships }`.
`clock` (default: system time) makes expiry testable; `enqueue` is the invitation delivery seam
(ADR-0008) and defaults to a no-op until the Outbox exists. `invite` and `resendInvitation` return the
raw `token` so Staff can copy the link; only its SHA-256 digest is stored.

`memberships` (partner actor `{ kind: 'partner', userId }`; allowed while the partner is `onboarding` or `active`):
`updateMembership(actor, id, { roles?, status? }, expectedVersion)` (role change, suspend, reactivate, end;
actor must be an active Partner Administrator; `stale-membership` on a version mismatch; `ended` is final),
`leave(actor, id)` (a member ends their own membership), `listMembers`, plus `acceptInvitation` and
`resolvePartnerContext`. Every change bumps `authorization_version` and writes its `membership.*` audit row.
Any change that would leave the partner without an active Partner Administrator returns
`last-administrator`, checked under the partner row lock.

`invitations` (Staff with `partners.manage`, or a partner actor who is an active Partner Administrator of
that partner; allowed while the partner is `onboarding` or `active`). `invite` returns `already-member`
for an email with an active or suspended membership. A partner actor cannot tell a missing partner or
invitation from one it may not touch (`forbidden`):
`invite` (replaces a pending invitation for the same email), `resendInvitation` (same invitation,
expiry reset to 7 days, new token, older tokens stay valid), `revokeInvitation`,
`listPendingInvitations`, and the read-only `getInvitation(token)`.

`partners`:

| Operation                       | Notes                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `createPartner(actor, input)`   | New partners start `onboarding`. `code-taken` on a duplicate code.                                  |
| `updatePartner(actor, id, ...)` | Names any time; `code` only while `onboarding` (`code-locked`). A no-op change writes no audit row. |
| `listPartners` / `getPartner`   | Staff reads.                                                                                        |

All operations return typed results (`{ success: true, data } | { success: false, error }`) and refuse
actors without `partners.manage` (`forbidden`). Each change commits together with its
`partner_access_history` row.

## Adding write paths

Any later operation that changes a Business Partner (status changes, memberships, invitations) must
lock the partner row first (`lockBusinessPartnerById`) and write its `partner_access_history` row in
the same transaction. `code` may only change while `onboarding`; that rule lives in `updatePartner`.

## Tests

Integration tests run against real Postgres through the harness in `src/testing/postgres`:

```bash
pnpm --filter @findeg/backend test:integration
```
