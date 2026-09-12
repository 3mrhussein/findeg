# Checkout notification delivery

Checkout records `order-accepted` and `guest-order-code` in
`system.checkout_outbox` in the same transaction as the accepted Order,
reservation and idempotency outcome. The worker only claims committed records.
The web process never calls a delivery provider during acceptance.

## Configuration

The worker requires `RELEASE_REVISION` and `DATABASE_URL`, and accepts `DB_SSL`.
Development and tests default `DELIVERY_ADAPTER` to `sink`. The Sink persists
messages in `system.notification_sink`, deduplicated by the outbox delivery ID;
it does not send email or SMS. Restrict database access: both tables contain
Customer email addresses and the guest verification code.

Production startup rejects every currently available adapter, including a missing
adapter, the Sink, unknown names, and claimed validation flags. No production
provider has been selected or validated. Adding one requires a reviewed adapter,
its required configuration, sender setup and controlled live-route validation;
an environment boolean cannot establish that evidence. Web and worker must use
the same release revision. A running web process alone does not certify delivery.

| Worker setting               | Default | Purpose                                             |
| ---------------------------- | ------- | --------------------------------------------------- |
| `OUTBOX_MAX_ATTEMPTS`        | 5       | Attempts before exhaustion (1–20)                   |
| `OUTBOX_POLL_MS`             | 1000    | Idle/error polling interval (10–60000 ms)           |
| `OUTBOX_RETRY_MS`            | 5000    | Initial exponential retry delay, capped at one hour |
| `OUTBOX_DELIVERY_TIMEOUT_MS` | 10000   | Delivery deadline (10–30000 ms)                     |

## Retries and recovery

Each claim increments the durable attempt count and acquires a sixty-second
lease using row locking with `SKIP LOCKED`. Delivery happens after the claim
transaction commits. Multiple workers can make progress without claiming the
same active lease. Completion and failure updates require that lease's token,
so a stale worker cannot overwrite a newer attempt. A crashed worker's lease
becomes retryable; an expired final attempt becomes exhausted.

Every attempt passes the original outbox ID to the adapter. Adapters must use
that ID as the provider deduplication key where supported. Delivery is at least
once: a crash after provider acceptance and before database acknowledgement can
cause another attempt. The local Sink deduplicates that window. A future provider
without deduplication may deliver duplicates. Adapters must honor cancellation
and their own network deadlines.

`SIGTERM`/`SIGINT` stops polling and waits for the active bounded attempt before
closing database connections. Restarting the worker resumes durable pending
work. Failed payloads remain in the outbox; exhausted records are never deleted
or automatically reset. Error categories are retained without provider error
text, which may contain credentials or Customer data.

## Operator inspection

`/health/live` reports process liveness and release revision. `/health/ready`
reports queue counts, returning 503 if the database is unavailable or any record
is exhausted. Provider failures and timeouts are observable as retrying work;
monitor pending age and exhaustion independently of liveness.

Use restricted database access to investigate without displaying payloads:

```sql
SELECT id, kind, status, attempts, last_error, next_attempt_at, lease_until
FROM system.checkout_outbox
WHERE status <> 'delivered'
ORDER BY created_at;
```

After correcting the cause, an operator may deliberately retry a selected
exhausted notification, preserving its ID and payload. Record the investigation
and previous attempt count in the incident log before resetting the retry budget:

```sql
UPDATE system.checkout_outbox
SET status = 'pending', attempts = 0, next_attempt_at = now(),
    lease_token = NULL, lease_until = NULL
WHERE id = '<investigated-delivery-id>' AND status = 'exhausted';
```

Guest verification codes expire fifteen minutes after checkout. Delivery retry
does not extend validity or issue a new code. Do not replay expired codes as an
access recovery mechanism; code reissuance is a separate capability.

Delivered rows and Sink payloads are retained by default. Any scheduled cleanup
must select only delivered rows under an approved retention policy; never purge
pending, processing or exhausted notifications. Avoid copying payloads to logs.
