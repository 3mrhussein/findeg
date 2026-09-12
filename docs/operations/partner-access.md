# Partner access

Issue #56 adds the Partner Workspace to the unified web host. A Business Partner
starts in `onboarding`; only `active` partners with an active membership are
operational. Phase one supports Partner Schools only. Official bilingual school
names and the stable code are entered by FindEg during onboarding.

## Administration

An Access Administrator enters `/{locale}/back-office/partners`, creates the
Business Partner, and issues its initial `partner-administrator` invitation.
The invited existing User signs in with the matching verified email and accepts.
FindEg can then activate the Business Partner. There is no automatic bootstrap
membership or grant from legacy organization, portal-role, or staff records.
Account creation and email-verification delivery are not supplied by this ticket;
use existing verified User records. No public endpoint can mark an email verified.

The Back Office page returns a partner-specific administration URL. Retain that
URL for later lifecycle and access administration. Partner Administrators use
`/{locale}/partner/{businessPartnerId}` to issue/reissue/revoke invitations, change
fixed roles, suspend/reactivate/end memberships, and inspect access history.
Lists, collection operations, reports, and school profile editing belong to their
subsequent workflows. The Collection Staff role grants none of those unfinished
operations; phase-one School Collection remains excluded.

Invitations contain a normalized email, fixed roles, inviter, expiry, and digest.
The web process accepts `PARTNER_INVITATION_DAYS` (integer 1–30, default 7).
Issuing another invitation for the same email and partner revokes the previous
pending token. Issue responses never query or reveal whether the email has a User
account. The administration page displays a link to share with that recipient;
there is no email/SMS delivery claim or configured production provider here.
The token is in the link fragment, removed from browser history on opening, and
submitted in a POST body. Store and audit records never contain the raw token.
An expired, revoked, already accepted, wrong-email, or unverified-email invitation
creates no access. Active/suspended membership blocks acceptance; ended tenure
allows a new invitation and a new membership while retaining history.

## Current Session and authorization

The authentication cookie holds no selected partner. One eligible membership is
selected automatically; multiple eligible memberships require a choice. The
selected Business Partner lives in the route and is reauthorized for each command
and query. Opening two partner URLs or Back Office in separate tabs does not
change another tab. Partner Roles are never combined across memberships, and
staff grants never provide Workspace eligibility.

Partner Administrator manages access; List Manager, Collection Staff, and Report
Viewer cannot. Roles are fixed and additive. An active Business Partner must retain
an active Partner Administrator; concurrent membership changes serialize on its
record before checking this invariant. Closed partners and ended memberships are
terminal. Suspended membership or partner status immediately denies further
Workspace operations while preserving valid authentication and other portals.

Identity authorization versions retain their existing meaning. The selected
Partner context additionally carries its own authorization version, composed from
the partner and membership versions. Membership and partner changes advance these
versions; all roles and lifecycle facts are re-read on every operation. Partner
context never trusts a client snapshot. Access history records actor, timestamp,
Business Partner, action, and before/after values in the transaction. Partner
Administrators see only their own partner's history. No hard-delete operation is
exposed. Future School Supply List publication must enforce partner lifecycle and
withdrawal under #57; this ticket does not publish or mutate lists.

## Migration and checks

Apply the single migration history with `pnpm migrate` before serving this
revision. Migration 0003 adds four Partner Management-owned tables. SQL constraints
limit lifecycle values and roles, prevent multiple pending invitations per
partner/email, and prevent duplicate current memberships or reuse of an accepted
invitation. Authorization, invitation consumption, membership changes, and access
history share a transaction; exceptions roll back the entire operation.

`tests/partner-memberships.test.mjs` runs in the required PostgreSQL quality gate.
It exercises invitation identity/verification, expiry, revocation, resending,
concurrent replay, technical rollback, additive roles, lifecycle and final-admin
protection, scope isolation, and production HTTP adapters in both languages.
It creates and removes only a unique test database. JSON mutations require a
same-origin Origin; authenticated responses are not cached and authorization
denials do not delete the session cookie. The canonical routes are in
[OpenAPI](../contracts/openapi/v1.yaml).
