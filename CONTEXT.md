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

**List Offer**:
A percentage discount on one School Supply List, active for a time window, applied to every line of that list's selections.
_Avoid_: List discount, coupon, promotion

**Order Acceptance**:
The single atomic moment an Order comes into existence: re-quoted, stock reserved, attribution snapshotted. Not an order status.
_Avoid_: Order placement, order creation, confirmed order

**Idempotency Key**:
A client-chosen key that makes retrying an Order Acceptance return the original result instead of a second Order.
_Avoid_: Request id, nonce

**Order Reference**:
The short, public, human-readable identifier of an Order, used by Customers, couriers, and support.
_Avoid_: Order number, order id, tracking code

### Partner Rewards

**Partner Points**:
The reward a Partner School earns on orders placed from its School Supply Lists.
_Avoid_: Credits, commission, loyalty points

**Reward Rate**:
A Business Partner's configured conversion between money charged and Partner Points, and between Partner Points and EGP value.
_Avoid_: Commission rate, multiplier

**Reward Entitlement**:
The Partner Points (and their EGP value) fixed for one attributed order line at Order Acceptance.
_Avoid_: Reward, accrual

**Reward Event**:
An immutable ledger entry that moves an Entitlement's points between pending, earned, and reversed.
_Avoid_: Transaction, reward log

**Reward Statement**:
A Business Partner's pending, earned, and reversed Partner Points and EGP value, derived from its Reward Events.
_Avoid_: Balance, wallet

### Inventory

**Stock Reservation**:
Units held for an accepted Order at a specific warehouse, from Order Acceptance until they are consumed at delivery or released on cancellation.
_Avoid_: Allocation, hold
