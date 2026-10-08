# Outbox Feature

One general transactional outbox (`system.outbox`, ADR-0008). A feature writes a message with
`enqueue(tx, id, kind, payload)` on its own transaction; `drainOutbox({ limit })` delivers it
afterwards, at least once.

- **Producers outside Backend** (e.g. `@findeg/orders`) call the same `enqueue` from
  `@findeg/db/queries/outbox`, a connection-free entry that writes only on the caller's
  transaction. Claiming, completion and retries stay in this feature and `outboxQueries`.
- **Ids** come from the business fact (`order-accepted:<ref>`), so enqueueing twice is a no-op.
- **Payloads** hold ids only (`{ orderId }`). The email is rendered when it is sent.
- **Claiming** takes one due row `FOR UPDATE SKIP LOCKED` with a 60 second lease; completion is
  guarded by the lease token, so an overlapping or stale drain can't overwrite a newer outcome.
- **Retries** back off 30s × 2^n (capped at 1h) for 8 attempts, then the row is `exhausted` and kept.
- **Secret-bearing rows** whose request has expired end as `expired` (handler returns `'expired'`)
  and are never sent.
- **Email** goes through an injectable `EmailProvider` (Resend by default, passing the row id as
  `idempotencyKey`).

## Kinds

- `order-accepted:<ref>`: confirmation email, enqueued by checkout.
- `order-status:<ref>:<status>`: `shipped`, `delivered` and `cancelled` emails, enqueued by
  `createOrders().changeStatus` in the same transaction as stock settlement and audit. The id carries the status, so a repeated
  transition sends nothing new.
- `guest-access:<requestId>`: guest access code email.
- `partner-invitation:<invitationId>:<delivery>`: Partner Invitation email, enqueued by the caller of
  `invite` / `resendInvitation` (the Dashboard) through the invitation's `enqueue` seam. The
  payload is `{ invitationId }`; `<delivery>` is unique per issue or resend, so a resend is not
  deduplicated. The handler mints a fresh token on every attempt (digest stored beside the
  earlier ones) and ends the row `expired` if the invitation is no longer pending or its Business
  Partner is no longer open.

## Exhausted rows

The Dashboard shows the exhausted count (`countExhaustedOutbox`) and lists the rows
(`listExhaustedOutbox`). Staff retry (`retryOutbox(id)`) puts a row back to `pending` with a fresh
attempt budget; it returns false if the row is no longer exhausted.

## Triggers

1. The enqueueing route calls `drainOutbox()` through Next.js `after()` once its response is sent.
2. The sweeper, `POST /api/internal/outbox/drain` on the storefront, authenticated with
   `Authorization: Bearer $OUTBOX_SWEEPER_SECRET`. It drains due rows, purges `delivered` rows
   older than 30 days and checkout idempotency rows older than 24 hours, and returns counts per
   status. With no secret configured it rejects every call.

## Scheduler requirement

**The host must call the sweeper once a minute** (cron job, scheduled workflow, platform cron).
Without it, failed deliveries are only retried when new traffic triggers a drain, and purging never
runs.

```bash
curl -fsS -X POST -H "Authorization: Bearer $OUTBOX_SWEEPER_SECRET" https://<storefront>/api/internal/outbox/drain
```
