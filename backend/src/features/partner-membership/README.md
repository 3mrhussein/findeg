# Partner Membership Feature

Business Partners and (in later tickets) who may work inside their Partner Workspace. See
[ADR-0003](../../../../docs/adr/0003-partner-membership-model.md) and the terms in `CONTEXT.md`.

Partner access is a parallel model next to Staff RBAC: this feature never depends on
`PermissionService`; Staff operations take an explicit `StaffActor` and require `partners.manage`.

## Public interface (barrel)

`createPartnerMembershipServices({ db? })` returns `{ partners }`:

| Operation                       | Notes                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `createPartner(actor, input)`   | New partners start `onboarding`. `code-taken` on a duplicate code.                                  |
| `updatePartner(actor, id, ...)` | Names any time; `code` only while `onboarding` (`code-locked`). A no-op change writes no audit row. |
| `listPartners` / `getPartner`   | Staff reads.                                                                                        |

All operations return typed results (`{ success: true, data } | { success: false, error }`) and refuse
actors without `partners.manage` (`forbidden`). Each change commits together with its
`partner_access_history` row.

## Tests

Integration tests run against real Postgres through the harness in `src/testing/postgres`:

```bash
pnpm --filter @findeg/backend test:integration
```
