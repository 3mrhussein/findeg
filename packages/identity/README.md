# @findeg/identity

Bounded context for Customer and Staff identity: authentication, permissions, Current Session
payloads, and account administration. Every business value comes from `@findeg/domain` through
`@findeg/db` identity types (ADR-0020).

## Entries

- `@findeg/identity`: services factory (`createIdentityServices`), facades (`login`, `logout`,
  `updateProfile`, `updateMyProfile`, `getMyAccountData`) and the public types.
- `@findeg/identity/types`: pure contract entry (types, Zod schemas, `PERMISSION_CODES`,
  authorization predicates, auth messages and error definitions). Client code uses this entry.

## Layout (ADR-0019)

| Feature | Responsibility |
| --- | --- |
| `features/authentication` | Credential login, Customer registration, `AuthService`. |
| `features/permissions` | Role and permission checks against the resolved authorization context. |
| `features/current-session` | Builds the Current Session payload and resolves identities for the session provider. |
| `features/admin-users` | Staff user administration and permission overrides. |
| `features/admin-roles` | Role administration. |
| `features/accounts` | Customer profiles and the "My Account" read model (Orders come from `@findeg/orders`). |
| `features/contracts` | Identity value objects and authorization predicates derived from `@findeg/db/types`. |

## Boundaries

- Token and cookie infrastructure (JWT signing, cookie sessions) stays in `backend/src/features/core`
  behind the session ports. `JwtTokenService` lives there.
- `ResourceNotFoundError` and the other shared errors come from `@findeg/domain-errors`.
- Dependencies: `@findeg/db`, `@findeg/domain`, `@findeg/domain-errors`, `@findeg/orders`.
