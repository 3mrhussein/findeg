# Guest Order Access

Lets a guest reach one Order without an account (ADR-0008).

1. `requestAccess({ reference, email })` always answers `{ success: true }` for well-formed input.
   Only when the reference and the checkout `guestEmail` match (and fewer than 3 requests exist for
   the Order in the last hour) does it create a `sales.guest_access_requests` row (valid 15
   minutes, 5 verification attempts) and enqueue `guest-access:<requestId>` in the same transaction.
2. The outbox handler mints a fresh 6-digit code **per send attempt** and stores only its HMAC in
   `sales.guest_access_codes`. A retried or duplicated email therefore carries another working code.
   A consumed, expired or out-of-attempts request ends the row as `expired` without sending.
3. `verify({ reference, code })` counts an attempt against the Order's live requests; a matching
   code consumes its whole request and returns a signed token (30 minutes) naming that one
   Order Reference. The storefront stores it in an httpOnly cookie.
4. `getOrder(token, reference)` returns the Order only if the token was issued for that reference.

Needs `GUEST_ACCESS_SECRET` (min 32 chars); every operation that signs or hashes fails closed
without it. No rate limiter exists beyond the per-order request count.
