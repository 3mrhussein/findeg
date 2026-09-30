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

**List Selection**:
A Customer's in-progress choices against one published School Supply List (a variant and quantity per list item), kept apart from the Cart and from every other list, and checked out as its own Order.
_Avoid_: List cart, cart kit, list session

**List Completeness**:
Whether a List Selection covers every required list item at its prescribed quantity, with any eligible substitute counting. It is advisory and never blocks checkout.
_Avoid_: List validation, list progress

**List Offer**:
A percentage discount on one School Supply List, active for a time window, applied to every line of that list's selections.
_Avoid_: List discount, coupon, promotion

**Order Acceptance**:
The single atomic moment an Order comes into existence: re-quoted, stock reserved, attribution snapshotted. Not an order status.
_Avoid_: Order placement, order creation, confirmed order

**Idempotency Key**:
A client-chosen key that makes retrying an Order Acceptance return the original result instead of a second Order.
_Avoid_: Request id, nonce

**Guest Order Access**:
How a Customer without an account views their Order: they give its Order Reference and email, and prove it with a one-time code sent to that email on request.
_Avoid_: Order tracking, guest login

**Outbox**:
The durable record of messages that must be sent because something was committed, written in the same transaction and delivered afterwards, at least once.
_Avoid_: Queue, notification log, email jobs

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
A Business Partner's pending, earned, reversed, and settled Partner Points and EGP value, and its Available Balance, derived from its Reward Events and Reward Settlements. For a month, it runs from an opening to a closing Available Balance through that month's earned, reversed, adjusted, and settled movements.
_Avoid_: Balance, wallet

**Partner Report**:
What a Business Partner's members see of its rewards: the monthly Reward Statement, its Reward Settlements, and the sales from its School Supply Lists in aggregate. It never identifies a Customer or an Order.
_Avoid_: Dashboard, analytics

**Reward Settlement**:
A FindEg Staff record of an EGP payout already made to a Business Partner outside FindEg, or the void of a mistaken one.
_Avoid_: Payout, withdrawal, redemption

**Available Balance**:
The EGP a Business Partner can still be settled: earned minus reversed, plus adjustments, minus settled. It is negative when reversals follow a settlement, and the debt is offset by later earnings.
_Avoid_: Wallet balance, credit

### Inventory

**Stock Reservation**:
Units held for an accepted Order at a specific warehouse, from Order Acceptance until they are consumed at delivery or released on cancellation.
_Avoid_: Allocation, hold
