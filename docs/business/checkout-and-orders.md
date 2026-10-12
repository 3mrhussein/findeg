# Checkout & Orders

As of 2026-10-12 · Clarity: **Clear**

## Purpose

Turn a Cart or a List Selection into an accepted cash-on-delivery Order, at exactly the price the Customer agreed to, and take it through fulfilment while keeping stock counts true. Guests buy and track Orders as easily as signed-in Customers.

## Actors

| Actor | Role in this area |
|---|---|
| Customer (guest or signed in) | Checks out, receives emails, looks up their Order |
| FindEg Staff (operations) | Moves Orders through fulfilment, cancels, refunds, adjusts inventory, resends failed emails |
| Courier and support | Identify an Order by its Order Reference; not users of the product |

## Terms

**Cart**: The catalog variants and quantities a Customer intends to buy. It carries no prices and never contains List Selections. _Avoid_: Basket, bag.

**Quote**: FindEg's authoritative pricing of a set of lines at a moment in time: unit prices, discounts, line totals, shipping and total, plus a Confirmation. Discounts are per-line entries tagged by their source. _Avoid_: Estimate, cart total.

**Order Totals**: The money of a Quote or Order: the gross subtotal before discounts, the discount, the net subtotal after it, the shipping fee and the total (net subtotal plus shipping).

**Confirmation**: The terms of a Quote that the Customer agrees to: lines, per-line discounts, List Offer, list and Public Code, shipping, total and currency. An Order is accepted only if a fresh Quote still has the same terms. _Avoid_: Price token, checksum.

The List Offer (a list's percentage discount) is defined in [School Supply Lists](school-supply-lists.md); CO-8 says how a Quote applies it.

**Order Acceptance**: The single all-or-nothing moment an Order comes into existence: re-priced, stock reserved, prices and attribution frozen. It is not an Order Status. _Avoid_: Order placement, order creation, confirmed order.

**Order**: A Customer's accepted purchase, from either the Cart or exactly one School Supply List. An Order from a list is also an Attributed Order (see [Partners](partners.md)).

**Order Reference**: The short, public, readable identifier of an Order: `FE-` plus 6 characters. It is not a secret. _Avoid_: Order number, order id, tracking code.

**Order Status**: Where an Order is in fulfilment: pending, confirmed, processing, shipped, delivered, cancelled or refunded. **Confirmed** means Staff phoned the Customer and the Customer confirmed the cash-on-delivery Order. Customers see it. It is not Order Acceptance.

**Payment Status**: Whether the Order's money has been collected: unpaid, paid or refunded. It is separate from Order Status and has no stock effect, but it becomes paid only once the Order is delivered and refunded only with the Order.

**Stock Reservation**: Units held for an accepted Order at a specific warehouse, from Order Acceptance until they are consumed at delivery or released by Cancellation. _Avoid_: Allocation, hold.

**Cancellation**: Stopping an Order before delivery, including a parcel refused at the door or returned. It releases the Stock Reservation. A shipped Order is cancelled only when Staff state that the parcel is back in the warehouse. _Avoid_: Refund (before delivery), void.

**Refund**: Returning a Customer's money for a delivered, paid Order. The Order and its payment both become refunded, together. It has no stock effect; returned goods are restocked by a manual inventory adjustment. _Avoid_: Cancellation, return.

**Guest Order Access**: How a Customer without an account views an Order: they give its Order Reference and email, and prove it with a one-time code emailed on request. _Avoid_: Order tracking, guest login.

### Quoting & Atomic Order Acceptance Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Client)
    participant Server as Quoting & Checkout Engine
    participant DB as Orders DB
    participant Inv as Warehouse Inventory
    participant Outbox as Outbox Queue

    Customer->>Server: Request Quote (Cart / List Selection lines)
    Server->>Server: Compute exact line prices, discounts (List Offer) & 50 EGP flat shipping
    Server->>Server: Generate Confirmation Digest (cryptographic terms fingerprint)
    Server-->>Customer: Return Quote + Confirmation Digest

    Customer->>Server: Submit Checkout (Confirmation Digest, Address, COD, IdempotencyKey)
    Server->>Server: Re-run fresh Quote against live catalog
    alt Confirmation Digest Mismatch (Price or List Offer changed)
        Server-->>Customer: 409 Conflict: Quote Expired / Changed (Requires Reconfirmation CO-3)
    else Confirmation Digest Verified
        Server->>Inv: Check on-hand stock for all variants
        alt Insufficient Stock for any line
            Inv-->>Server: Stock shortage
            Server-->>Customer: 422 Unprocessable: Insufficient Stock (All-or-nothing rejection CO-4)
        else Stock Available
            rect rgb(240, 248, 255)
            note over Server,Outbox: Atomic Transaction: Order Acceptance
            Server->>DB: Insert Order (FE-xxxxxx, pending, unpaid, frozen lines & attribution)
            Server->>Inv: Create StockReservation (Hold units per warehouse)
            Server->>Outbox: Enqueue Order Confirmation Email
            end
            Server-->>Customer: 201 Created: Order Accepted (FE-xxxxxx)
        end
    end
```

## Capabilities

| Actor | Capability | State |
|---|---|---|
| Customer | Check out the Cart, as a guest or signed in | Built |
| Customer | Check out a List Selection as its own Order | Built |
| Customer | Pay cash on delivery | Built |
| Customer | Pay by card | Not settled (needs a payment design first) |
| Customer | Be asked to reconfirm when a price, offer or shipping changed since the Quote | Built |
| Customer | Receive confirmation, shipped, delivered and cancelled emails | Built |
| Guest | Look up an Order with its reference, email and a one-time code | Built |
| Signed-in Customer | See their Orders in their account | Built |
| Staff | Move Orders through fulfilment, one at a time or in bulk | Built |
| Staff (Operations) | Phone the Customer to confirm a cash-on-delivery Order, then mark it confirmed | Decided (launch) |
| Staff | Cancel an Order, including a shipped one once the parcel is back | Built |
| Staff | Refund a delivered Order | Built |
| Staff | Adjust inventory per warehouse | Built |
| Staff | See and resend emails that failed every attempt | Decided |
| Staff | Set a List Offer | Built (see [School Supply Lists](school-supply-lists.md)) |
| Customer | Coupons, stacked discounts, delivery zones, backorders, partial acceptance | Not settled |

## Rules

- **CO-1** An Order comes from the Cart or from exactly one School Supply List, never both.
- **CO-2** FindEg prices everything. Prices sent from the Customer's device are never trusted.
- **CO-3** An Order is accepted only if a fresh Quote produces the same Confirmation the Customer agreed to. Otherwise the Customer must reconfirm. A List Offer that starts, changes or ends in between counts as a change.
- **CO-4** Order Acceptance is all or nothing: re-price, reserve stock and freeze prices and attribution in one step. Not enough stock rejects the whole Order. There is no partial acceptance and no backorder.
- **CO-5** Retrying the same checkout never creates a second Order: it returns the original. A retry that changes the request is rejected.
- **CO-6** Phase one accepts cash on delivery only.
- **CO-7** Shipping is one flat fee of 50.00 EGP for every Order and payment method, with no delivery zones, no free-shipping threshold and no minimum order value. It is a business constant, not a setting.
- **CO-8** The List Offer is the only discount. It applies to every line of the list's Order, including substitutes, and each line is rounded half-up to two decimals.
- **CO-9** Money is EGP with exactly two decimals (`12.00`, `12.99`), any two-decimal amount being valid. It is never negative, and an amount with more decimals is refused, never rounded. Prices include VAT.
- **CO-10** An accepted Order's prices, discounts, shipping and attribution never change, and Orders and their lines are never deleted.
- **CO-11** Stock is reserved at acceptance, consumed when the Order is delivered and released when it is cancelled. A Refund changes no stock.
- **CO-12** Order Status moves only along: pending → confirmed or cancelled; confirmed → processing or cancelled; processing → shipped or cancelled; shipped → delivered or cancelled; delivered → refunded. Cancelled and refunded are final, and nothing returns to pending. Payment Status moves unpaid → paid, only once the Order is delivered, and paid → refunded only through a Refund. Asking for the status an Order or payment already has changes nothing.
- **CO-13** A Refund follows only delivery, needs a paid Order, and moves the Order and its payment to refunded together; a payment is never refunded alone. Stopping an Order before delivery is always a Cancellation. A shipped Order is cancelled only when Staff state that the parcel is back in the warehouse, and the product refuses the cancellation without that statement.
- **CO-14** Every Order has an Order Reference. Knowing it alone grants nothing.
- **CO-15** Guest Order Access: the lookup always answers the same way, so it never reveals whether an Order exists. A code is valid for 15 minutes and 5 tries, and an Order allows 3 code requests per hour.
- **CO-16** Order emails are sent only after the change is saved, and are retried until delivered: the confirmation at acceptance, and shipped, delivered and cancelled at most once each. No other status, Refund included, sends an email.
- **CO-17** Business Partner Status never affects checkout, acceptance or fulfilment.
- **CO-18** An Order becomes confirmed only after Staff have phoned the Customer and the Customer confirmed it. Confirmed is shown to Customers.
- **CO-19** Every Order has an Egyptian mobile number, so Staff can phone to confirm, and a shipping address in one of Egypt's 27 governorates. A guest Order also has an email.
- **CO-20** A Cart line is one variant with 1 to 999 units. Adding a variant already in the Cart adds to its line. An Order line holds 1 to 999 units too, the same bound as a list item (SL-17), since every Order comes from the Cart or one list; a larger line is refused.

## Lifecycle

### Synchronized Order, Payment & Stock State Lifecycle

```mermaid
stateDiagram-v2
    direction TB

    state "Pending (Unpaid)" as pending {
        [*] --> Pending_Active
        note right of Pending_Active: Stock: RESERVED\nPayment: UNPAID\nAttribution: FROZEN
    }

    state "Confirmed (Unpaid)" as confirmed {
        note right of confirmed: Confirmed via phone CO-18\nStock: RESERVED\nPayment: UNPAID
    }

    state "Processing (Unpaid)" as processing {
        note right of processing: Warehouse pick & pack\nStock: RESERVED\nPayment: UNPAID
    }

    state "Shipped (Unpaid)" as shipped {
        note right of shipped: In transit with courier\nStock: RESERVED\nPayment: UNPAID
    }

    state "Delivered (Paid)" as delivered {
        note right of delivered: Courier collects COD cash\nStock: CONSUMED CO-11\nPayment: PAID
    }

    state "Cancelled (Terminal)" as cancelled {
        note right of cancelled: Cancelled before delivery\nStock: RELEASED CO-11\nPayment: UNPAID
    }

    state "Refunded (Terminal)" as refunded {
        note right of refunded: Follows delivery only CO-13\nStock: UNCHANGED (Manual restock)\nPayment: REFUNDED
    }

    [*] --> pending: Order Acceptance (Atomic)
    pending --> confirmed: Customer confirmed by phone
    pending --> cancelled: Customer unreachable / cancelled
    confirmed --> processing: Dispatched to warehouse
    confirmed --> cancelled: Cancelled before packing
    processing --> shipped: Handover to courier
    processing --> cancelled: Cancelled before dispatch
    shipped --> delivered: Delivered & cash collected
    shipped --> cancelled: Parcel back in warehouse CO-13
    delivered --> refunded: Approved return after delivery
    cancelled --> [*]
    refunded --> [*]
```

## Known gaps

| # | Rule | What happens today |
|---|---|---|
| 1 | CO-6 | **Launch blocker.** Card still appears as a payment option at checkout, but it cannot be paid. |
| 2 | CO-7 | **Launch blocker.** Checkout shows 30 EGP shipping for card and 50 for cash on delivery, while the Order is always charged the flat fee. |
| 3 | Order Status term | Order emails can show a "returned" status that does not exist. |
| 4 | CO-7 | The flat fee can be overridden by an environment setting. |
| 5 | CO-12, CO-13 | A payment can be marked paid before delivery, or refunded without its Order; a Refund leaves the payment as it was; a shipped Order can be cancelled without stating that the parcel is back. |
| 6 | CO-19 | The phone check accepts some invalid Egyptian numbers and refuses real ones starting `+2010`, and a guest's email and phone are not required in every layer. The shipping address has no governorate. |
| 7 | CO-20 | Not every client limits a Cart line to 1 to 999 units, and an Order line has no upper bound. |

## Open questions

Each item names a suggested owner. Tick it when the answer is recorded on this page.

### Before launch

- [ ] **Unreachable Customer** (Operations): How many call attempts, over how long, before an unconfirmed Order is cancelled?
  Suggested: three attempts within 48 hours, then cancel with the reason "Customer unreachable".
- [x] **Phone number** (Product): Is a phone number required at checkout for every Customer? Confirmation by phone (CO-18) needs one.
  Answered 2026-10-12: required on every Order, as an Egyptian mobile number (CO-19).
- [ ] **"Returned" in emails** (Product): Is removing the non-existent "returned" status from Order emails a launch blocker?
  Suggested: yes; Customers would see a status FindEg never uses.
- [ ] **Delivery coverage** (Operations): Which governorates does FindEg deliver to at launch, with what delivery-time promise, and through which courier?
- [x] **Shipping fee** (Business): Is 50 EGP the launch flat fee? Is there a free-shipping threshold or a minimum order value?
  Answered 2026-10-12: 50.00 EGP flat, with no threshold and no minimum (CO-7).
- [ ] **VAT and receipts** (Finance): Do prices include VAT, and what must the Order confirmation show?
  Partly answered 2026-10-12: prices include VAT (CO-9). A VAT breakdown on the confirmation is out of scope for now.
- [ ] **Returns policy** (Business, Legal): Within how many days can a delivered Order be returned, for which reasons, and who pays return shipping? The returns Content Page and Refunds depend on it.
- [ ] **Customer cancellation** (Business): Can a Customer cancel their own Order before it ships, or only by contacting FindEg?
- [ ] **Cash collection** (Finance, Operations): Who marks an Order paid once the courier collects the cash, and how is courier cash reconciled?
- [x] **Returned parcels** (Operations): Is "cancel a shipped Order only once the parcel is back" checked by the product, or a Staff instruction?
  Answered 2026-10-12: the product checks it: Staff must state that the parcel is back (CO-13).

### After launch

- [ ] **Card payment** (Business, Product): When card returns, what shape does a payment option take, and how does it change the Quote?
- [x] **Refund and payment** (Finance): Should a Refund always set the Payment Status to refunded?
  Answered 2026-10-12: yes; the Order and its payment are refunded together (CO-13).
