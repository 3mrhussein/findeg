# School Lists Private Access Feature Spec

Last updated: 2026-02-17  
Status: Designed, deferred for implementation after public e-stationary shop completion.

## 1) Problem Statement

School lists are private. They must not be publicly browsable by school/grade from the storefront.
Access should be controlled by school-issued link or QR code, with user-level authorization checks.

## 2) Product Rules (Source of Truth)

1. School lists are not discoverable publicly.
2. A guest user can visit `/school` and attempt lookup/search, but must log in before viewing any list.
3. A school-provided link/QR can authorize a logged-in user automatically.
4. If logged-in and unauthorized, user cannot view list contents.
5. Unauthorized logged-in users can:
   - Send access request to school admin.
   - Use a valid link/QR from school admin to get authorized.
6. School admin dashboard is not implemented yet, but its workflows must be designed now.

## 3) Actors

- Guest user (not authenticated)
- Parent user (authenticated)
- School admin (future role/system)
- Platform backend

## 4) Target User Flows

### 4.1 Guest user opens `/school`

1. User enters school reference (code/link) or scans QR.
2. System checks auth session.
3. If no session:
   - Redirect to login with return URL.
   - Preserve pending school reference.
4. After login:
   - Resume authorization check.

### 4.2 Logged-in user opens school link/QR

1. URL contains secure token or claim payload.
2. Backend validates token (signature, expiry, school/grade scope, revocation).
3. If valid:
   - Persist authorization grant on user account.
   - User can access permitted list(s).
4. If invalid/expired:
   - Show access denied with clear recovery actions.

### 4.3 Logged-in user tries school lookup without valid grant

1. System resolves requested list metadata (without exposing full private data).
2. If user has no active grant:
   - Show “Not authorized” state.
   - Offer:
     - Send request to school admin.
     - Enter school-issued link/code.

### 4.4 Logged-in authorized user

1. User views list details.
2. User can add list items/bundles to cart.
3. Access is scoped to authorized school + grade + term/year.

## 5) Authorization Model

## 5.1 Core entities

- `School`
- `SchoolList` (school, grade, year/term, visibility state)
- `SchoolAccessToken` (issued by school admin/system)
- `SchoolUserAuthorization` (user-level grant)
- `SchoolAccessRequest` (request workflow record)

## 5.2 Grant persistence

When a logged-in user opens a valid link/QR:
- create or update `SchoolUserAuthorization`
- fields:
  - `userId`
  - `schoolId`
  - `scope` (`grade`, optional sections)
  - `grantedByTokenId`
  - `grantedAt`
  - `expiresAt` (optional)
  - `status` (`active`, `revoked`, `expired`)

## 5.3 Token requirements

- Signed (HMAC or asymmetric signature)
- Short/controlled expiry
- Scope-bound (school + grade + optional year)
- One-time or multi-use policy per school setting
- Revocation support
- Audit trail for issuance/consumption

## 6) UX State Model (Parent Side)

`/school` should support these states:

1. `idle` - prompt to paste link/code or search reference.
2. `guest_blocked` - login required.
3. `checking_authorization` - loading state.
4. `authorized` - show list and actions.
5. `unauthorized` - request access + guidance.
6. `token_invalid_or_expired` - actionable error.
7. `request_sent` - confirmation and next steps.

## 7) School Admin Side (Future Design)

Even without dashboard implementation now, required capabilities:

1. Create/manage school lists by grade/term.
2. Generate secure links/QR per list scope.
3. Set token policy (expiry, usage count, revocation).
4. Review access requests (approve/reject).
5. Revoke user authorization.
6. View audit logs:
   - token generated
   - token used
   - authorization granted/revoked
   - requests approved/rejected

## 8) API Design (Proposed, Deferred)

Parent-facing:
- `POST /api/v1/school/access/resolve`  
  Input: `reference` (code/url/token)  
  Output: auth state + metadata (no private list data unless authorized)

- `POST /api/v1/school/access/request`  
  Input: `schoolId`, `grade`, optional note  
  Output: request status

- `GET /api/v1/school/lists/:id`  
  Guarded endpoint; returns data only for authorized users.

Token consumption:
- `POST /api/v1/school/access/consume-token`  
  Input: token  
  Output: grant created/updated.

Admin-facing (future):
- `POST /api/v1/admin/schools/:schoolId/lists/:listId/tokens`
- `POST /api/v1/admin/school-access-requests/:id/approve`
- `POST /api/v1/admin/school-access-requests/:id/reject`
- `POST /api/v1/admin/school-authorizations/:id/revoke`

## 9) Security & Privacy Requirements

1. No full list data in unauthorized responses.
2. Rate limit token validation and request endpoints.
3. Log all access decisions for audit.
4. Protect against token replay where configured.
5. Enforce strict server-side authorization (not UI-only checks).
6. Avoid enumerating schools/lists from public endpoints.

## 10) User Stories (Ready for Backlog)

### Parent stories

- As a guest parent, I can start school-list lookup on `/school`, but must log in before viewing private list data.
- As a logged-in parent with a valid school link/QR, I am automatically authorized and can view my list.
- As a logged-in parent without authorization, I can request access from school admin.
- As a logged-in parent, I can see clear errors for invalid/expired links and how to recover.

### School admin stories (future)

- As a school admin, I can issue secure list links/QR codes per grade scope.
- As a school admin, I can approve/reject parent access requests.
- As a school admin, I can revoke parent access and rotate tokens.

## 11) Acceptance Criteria (High-Level)

1. School lists are not publicly discoverable via storefront navigation or open listing pages.
2. Any list data request requires authenticated user + active authorization.
3. Valid school link/QR grants authorization to logged-in user account.
4. Unauthorized users receive request-access flow.
5. All grant and token events are auditable.

## 12) Delivery Plan (Deferred Sequence)

This feature starts only after public shop finalization.

Phase A: foundation
1. Data model/migrations for grants, tokens, requests.
2. Guarded APIs for authorization checks and token consumption.

Phase B: parent flow
1. `/school` state machine implementation.
2. Login redirect/resume behavior.
3. Access request submission UX.

Phase C: admin flow
1. School admin dashboard for token/request management.
2. Authorization revoke/approve actions.

Phase D: hardening
1. Audit and monitoring.
2. E2E tests for guest/login/token/request paths.

## 13) Non-Goals for Current Phase

1. No school admin dashboard implementation now.
2. No school-list private-access backend implementation now.
3. Current sprint focus remains public e-stationary shop feature completion.
