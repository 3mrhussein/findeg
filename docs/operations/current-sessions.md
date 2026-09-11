# Current Sessions

Issue #54 restores Identity & Access in the unified web host. All three portals
use the same opaque `findeg_session` credential. Active Portal is resolved from
the requested route on every operation, never stored in the cookie or database
session. Opening Back Office in another tab therefore does not give Storefront
requests staff grants. An authenticated User may use the public Storefront;
Back Office requires at least one fixed staff role. Partner entry currently
returns an Authorization Denial: #56 supplies verified Partner Membership and
selected Workspace authorization. Staff status never implies Partner access.

The runtime requires `RELEASE_REVISION`, `DATABASE_URL`, and optional `DB_SSL`
(default `false`). Its PostgreSQL pool is limited to five connections per web
process; the runtime exposes `close()` for explicit shutdown by non-Next hosts.
Imports neither connect nor read configuration. Next owns the process lifecycle;
its process exit closes the process-scoped pool. Run `pnpm migrate` before
starting a revision requiring the new tables.

## Authentication and authorization

Sign-in uses existing `identity.users` and bcrypt `identity.password_credentials`
records. It does not provision accounts or map legacy portal roles, configurable
RBAC roles, direct grants, or legacy cookies into target access. The server issues
a random 256-bit token and persists only its SHA-256 digest. Sessions expire after
seven days without sliding renewal. Cookies are HttpOnly, SameSite=Lax, Path=/,
and Secure in production; production requires HTTPS. Sign-out revokes the stored
credential. Reauthentication rotates the current browser credential.

Every protected application operation reads authoritative User activity and
fixed grants in its transaction. The persisted Authorization Version is refreshed
when stale; only request-specific grants are returned. An Authorization Denial
preserves the credential and cookie. Expiry, revocation, inactive/deleted identity,
and password replacement invalidate sessions. Disabling and then re-enabling a
User cannot restore their old credential.

Database triggers advance the User Authorization Version on staff grant changes
and activity/email-verification changes, including operational SQL writes.
Disabling a User or changing/deleting their password revokes their sessions.
Application access changes lock the User and update grants in the same transaction
as authorization; callers never submit a trusted Current Session snapshot.

## Fixed additive staff roles

Each role grants `back-office.enter` plus the permission below. Multiple roles
add their permissions; no role hierarchy, wildcard, per-user override, or custom
role editor exists. Business modules must enforce the relevant permission in their
application operation when those workflows land.

| Role                   | Permission            |
| ---------------------- | --------------------- |
| `access-administrator` | `staff-access.manage` |
| `catalog-manager`      | `catalog.manage`      |
| `fulfillment-operator` | `fulfillment.manage`  |
| `finance-manager`      | `finance.manage`      |

The shipped privileged operation is `updateStaffAccess`: it requires an
Access Administrator in Back Office and changes an existing User's activity
and fixed roles atomically. Catalog, fulfillment, and finance operations remain
with their implementation tickets. Initial Access Administrator provisioning is
an operator database task after identifying the correct existing User; there is
no public bootstrap endpoint and no automatic grant from a legacy admin role.
Insert the intended `(user_id, 'access-administrator')` into
`identity.staff_role_grants` using the deployment's controlled database tooling.

## Web adapters and checks

`/{locale}/sign-in`, `/{locale}/back-office/sign-in`, and
`/{locale}/partner/sign-in` provide Arabic/English sign-in forms. JSON routes are
defined in [OpenAPI](../contracts/openapi/v1.yaml). Mutating cookie-authenticated
JSON requests must supply an Origin matching the incoming Host and protocol.
The reverse proxy must preserve the external Host and protocol. Next Server
Actions retain Next's built-in origin validation and call the same operations.
Authenticated reads are dynamic and return `Cache-Control: no-store`.

The quality gate exercises application policy, real PostgreSQL persistence,
restart, grant refresh and session invalidation, and production HTTP portal and
mutation behavior. These checks do not certify the remaining production gates
in #63, or the Partner Membership journey in #56.
