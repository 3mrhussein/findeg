---
status: accepted
---

# Transactional outbox and guest order access

ADR-0005 keeps side effects out of the Order Acceptance transaction, apart from writing rows. Emails stay best-effort until an outbox exists. Main sends email through Resend, but nothing reliable uses it. `ResendEmailService` swallows every error. `AdminOrderService` is wired to a no-op email service. `NotificationEventService`'s order hooks have no callers. Main also has no worker process: `backend/` is a library imported by two Next.js apps, and there is no queue, cron, or known hosting target. `develop` (reference only) uses a checkout-only `system.checkout_outbox`, a separate Node worker, and plaintext payloads that include the guest's one-time code. It also emails that code at acceptance with a 15-minute expiry, which delivery backoff can outlive. The research file lives on branch `research/cod-checkout-idempotency`, not on main.

Depends on ADR-0003 (Partner invitations), ADR-0005 (acceptance transaction, `transitionOrderStatus`, Order Reference).

## Decisions

**One general outbox.** A new `outbox` backend feature owns `system.outbox` (`id text PK, kind, payload jsonb, status pending|processing|delivered|exhausted|expired, attempts, next_attempt_at, lease_token, lease_until, last_error, delivered_at, created_at`). Any feature enqueues with `enqueue(tx, id, kind, payload)` on the caller's transaction. Row ids are derived from the business fact, so enqueueing twice is a no-op: `order-accepted:<ref>`, `order-status:<ref>:<status>`, `guest-access:<requestId>`, `partner-invite:<invitationId>`.

**Payloads hold references, not content.** A payload holds only ids (`{orderId}`, `{accessRequestId}`, `{invitationId}`). The worker loads the current data and renders the email when it sends it. No email address, secret, or rendered body is stored in the outbox.

**Delivery runs inside the existing apps; there is no worker process.** `drainOutbox({limit})` lives in the `outbox` feature and is triggered two ways:

- The route that enqueued rows calls it through Next.js `after()`, once the response has been sent.
- A protected sweeper route, `POST /api/internal/outbox/drain` with a bearer secret, is called every minute by the host's scheduler.

Claiming follows develop's approach: one due row `FOR UPDATE SKIP LOCKED` with a 60-second lease, and completion updates guarded by the lease token. Overlapping drains are therefore safe.

**At-least-once delivery, with provider dedup.**

- Ordinary emails pass the row id as Resend's `idempotencyKey`.
- An email that carries a secret (guest access code, Partner invitation link) mints a fresh secret on every attempt. Each new secret's hash is stored as an additional credential; nothing is overwritten. That email's dedup key is `<rowId>:<attempt>`.
- Every secret sent for a request stays valid until the request expires or one of its secrets is used, and using one consumes the whole request. A duplicate or retried email just carries a second working secret.
- No secret is ever persisted, not even encrypted.

**Retry, retention, readiness.**

- Retries use exponential backoff of 30s × 2^n, capped at 1h, for up to 8 attempts, then the row becomes `exhausted`.
- A secret-bearing row whose request has expired becomes `expired` and is never sent.
- The sweeper purges `delivered` rows after 30 days. `exhausted` rows are kept.
- The sweeper's response reports counts per status. The dashboard shows the exhausted count with a Staff "retry" action.

**Which order emails go through the outbox.**

- The Order Acceptance transaction enqueues the confirmation.
- `transitionOrderStatus` enqueues status emails for `shipped`, `delivered`, and `cancelled` in its own transaction. Each status sends at most once per order.
- The no-op email service and `NotificationEventService`'s order hooks are removed.

**Guest Order Access is on demand.**

- The confirmation email carries the Order Reference only; no code is created at acceptance.
- On the order-lookup page the guest enters the reference and their email. The endpoint always answers the same way, so it never reveals whether an order exists.
- If the reference and email match, it creates a `sales.guest_access_requests` row (valid 15 minutes, at most 5 verification attempts) and enqueues the code email. It allows at most 3 requests per order per hour, counted from those rows. Main has no rate limiter, and none is added for this.
- The 6-digit code is minted when the email is sent (see dedup above). Only its hash is kept, in `sales.guest_access_codes`, which can hold several codes per request.
- A successful verification sets a short-lived signed cookie scoped to that order.
- Signed-in Customers see their orders through their account.

## Considered options

- **Checkout-only outbox (develop).** Rejected because status emails and Partner invitations need the same guarantee. `transitionOrderStatus` already owns a transaction, so their enqueue costs nothing extra.
- **Separate long-running worker (develop).** Rejected because the hosting target is unknown and may be serverless. The `after()` trigger plus the sweeper route works on any host.
- **pg-boss or a queue library.** It would add a dependency and its own schema for what is one table and one claim query.
- **Rendered or plaintext payloads (develop).** Rejected because they store email addresses and secrets for as long as rows are kept, and they freeze templates and locale at enqueue time.
- **Code emailed at acceptance (develop).** Rejected because delivery backoff can outlive the code's expiry, and it creates secrets nobody asked for.
- **Secret generated once and stored encrypted in the payload.** It would allow a single stable code, but it requires key management and a stored secret. Minting per attempt avoids both.

## Consequences

- Hosting must provide a once-a-minute scheduler, such as a cron job or scheduled workflow, that calls the sweeper. Without it, retries only happen when new traffic triggers a drain.
- **Partially implemented.** Partner invitation delivery is not wired: the `enqueue` seam in `createPartnerMembershipServices` defaults to a no-op, the dashboard actions pass none, and no `partner-invitation` handler exists. The outbox kind is `partner-invitation`, not `partner-invite`.
- ADR-0003's invitation token must allow several valid hashes per invitation, following the secret-bearing email rule above.
- The `resend` SDK version must support `idempotencyKey`. Bump it if it doesn't.
- Guest order lookup and code-entry pages must be added to `frontend/storefront`. The current `OrderConfirmation` shows the serial `#id`, which must be replaced by the Order Reference.
