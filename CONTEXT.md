# FindEg

FindEg is an Egyptian school-supplies store: Customers buy ordinary catalog items or fill a Partner School's School Supply List, paying cash on delivery.

## Language

### Customers and School Supply Lists

**Customer**:
A person who shops on the storefront, whether browsing generally or fulfilling a School Supply List.
_Avoid_: Parent, buyer, account

**Business Partner**:
An organization the platform has a commercial relationship with. A Partner School is one kind of Business Partner.
_Avoid_: Partner (ambiguous alone — always qualify: Partner School, etc.)

**Partner School**:
A Business Partner that is a school: the entity a School Supply List is published on behalf of. Modeled as a `businessPartnerId` reference plus school-specific attributes (governorate, area, school type, academic system), not as free-text fields on the list itself.
_Avoid_: School (ambiguous — a school is always a kind of Business Partner, never a standalone entity)

**School Supply List**:
A curated list of items a Partner School asks its Customers to purchase, moving through Draft, Published, and Archived states. Customers reach it via a public, unguessable code rather than a login.
_Avoid_: School List, Parent List

**School Supply List Item**:
One line of a School Supply List: either an Exact Item or a specification a Customer's choice must satisfy (see Allowed Alternative). Required or optional per item.
_Avoid_: School List Item

**Exact Item**:
A School Supply List Item that names one specific product variant with no substitution allowed.
_Avoid_: —

**Allowed Alternative**:
Any product variant matching a School Supply List Item's frozen specification (category plus attributes), computed at selection time rather than pre-selected by an admin. Applies only to items that are not Exact Items.
_Avoid_: Curated alternative

**List Replacement**:
A newly published School Supply List that supersedes a previously published one for the same Partner School, via a replacement chain (source → replaces → replaced-by). The superseded list becomes Archived: still viewable, no longer checkoutable.
_Avoid_: —

**Draft / Published / Archived** (School Supply List status):
A School Supply List's lifecycle state. Draft is freely editable. Published freezes its List Item Specifications, default product variants, and quantities — enforced below the application layer, not just by convention. Archived means superseded by a List Replacement or otherwise retired; still historically viewable, never checkoutable again.
_Avoid_: Active/inactive (conflates status with visibility)

**List Selection**:
A Customer's in-progress choices against a specific School Supply List's items, kept independent of and never merged into their ordinary Cart.
_Avoid_: Cart, list cart, cart kit

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
