# FindEg

FindEg is an Egyptian school-supplies store: Customers buy ordinary catalog items or fill a Partner School's School Supply List, paying cash on delivery.

## Language

### Checkout

**Quote**:
The server's authoritative pricing of a set of lines (unit prices, discounts, shipping, total) at a moment in time, carrying a Confirmation.
_Avoid_: Estimate, cart total

**Confirmation**:
A digest of a Quote's terms that the Customer agrees to; an Order is accepted only if a fresh Quote still produces the same Confirmation.
_Avoid_: Price token, checksum

**Order Acceptance**:
The single atomic moment an Order comes into existence: re-quoted, stock reserved, attribution snapshotted. Not an order status.
_Avoid_: Order placement, order creation, confirmed order

**Idempotency Key**:
A client-chosen key that makes retrying an Order Acceptance return the original result instead of a second Order.
_Avoid_: Request id, nonce

**Order Reference**:
The short, public, human-readable identifier of an Order, used by Customers, couriers, and support.
_Avoid_: Order number, order id, tracking code

### Inventory

**Stock Reservation**:
Units held for an accepted Order at a specific warehouse, from Order Acceptance until they are consumed at delivery or released on cancellation.
_Avoid_: Allocation, hold
