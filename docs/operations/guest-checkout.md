# Ordinary Cart and Guest Checkout

The Customer Storefront at `/en` and `/ar` supports a normal Cart, home-delivery
Cash on Delivery, price confirmation and Guest Order Access. School Supply List
commerce remains separate. The versioned HTTP contracts are in
[`v1.yaml`](../contracts/openapi/v1.yaml); all adapters invoke the same
transaction-backed `createStorefrontCommerce` application operations.

A `findeg_guest_cart` HttpOnly, Secure, SameSite=Lax cookie identifies the Cart.
It lasts thirty days. Missing or malformed cookies are replaced. Deploy behind
HTTPS; localhost is suitable for development. The database stores only its hash.
The UI preserves an uncertain checkout request in tab session storage so a retry
or reload reuses the same key and body. The receipt contains the opaque access
reference; Customers should save it. Clearing browser data removes the ability
to replay using that Cart owner, but the reference/code access path is independent.

Accepted Orders are unpaid. Checkout validates active Product Variants, exact EGP
prices, quantities, an Egyptian mobile number, required address fields and an
active delivery zone. A changed Cart, price or fee requires review again. The
transaction commits immutable Order snapshots, stock reservations, append-only
stock movements, the replay outcome, and two outbox records, then clears the Cart.
A structured rejection or exception rolls all of these writes back. Saved outcomes
are retained with the immutable Order. Retrying a successful request replays the
original receipt even after the Cart has been cleared.

Configure stock and active delivery zones before offering checkout. Delivery zones
are Commerce-owned `sales.delivery_zones` records with bilingual names and exact
EGP fees; this slice does not add delivery-zone administration.

## Notification integration boundary

`system.checkout_outbox` records `order-accepted` and `guest-order-code` messages
with stable IDs. Guest verification codes use cryptographic randomness, expire
fifteen minutes after acceptance and are consumed once. Only a digest is stored
in `sales.guest_order_access`; the code in the outbox is required for delivery.
Restrict operational access to outbox payloads, which include Customer contact data.

**#59 owns delivery.** The current worker does not consume these messages and
remains unready. Customers cannot receive verification codes through this release
alone. This work does not certify production readiness or select a provider.
The test harness observes the committed message as a simulated recipient; it does
not add a browser endpoint that reveals codes or a production delivery bypass.

## Verification

`pnpm quality:check` builds the runtime/web host and runs the existing gates plus
real PostgreSQL checkout tests and Arabic/English Cypress journeys. Install the
Cypress binary once with `pnpm --filter @findeg/web exec cypress install` (CI does
this explicitly). The database runner creates isolated test databases; browser
fixtures refuse non-test database names and are unavailable in the web runtime.
Tests cover malformed-cookie recovery, durable Cart reads, competing final-unit
purchases, concurrent idempotent retries, changed prices, immutable snapshots,
rollback after partial reservation and outbox failure, and one-time verification.
