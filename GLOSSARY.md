# FindEg

FindEg is an Egyptian stationery store that also sells gifts and toys: Customers buy from the FindEg catalogue and pay cash on delivery. Its Partner Program makes buying easier between the store and the clients of its biggest business customers; schools are the first partner segment, served through School Supply Lists.

## Language

### Catalogue

**Product**:
An item FindEg sells, sitting in one Category, with an optional Brand and any number of Tags. It is Active or Inactive; Customers buy its variants, never the product itself.
_Avoid_: Item (ambiguous with list items), Draft product

**Product Variant**:
One buyable version of a Product, such as a colour or size, with its own SKU, price, optional Compare-at Price and attribute values. It is Active or Inactive.
_Avoid_: Variation, option, SKU (the SKU is its code, not the variant)

**Default Variant**:
The variant shown first for a Product: the one flagged as default, otherwise the first in display order.
_Avoid_: Main variant, primary variant

**Compare-at Price**:
A variant's optional "was" price, always above its price, shown struck through beside it; the saving is shown as a whole percentage.
_Avoid_: Strike-through price, list price, original price

**Category**:
A node in the strict category tree used for navigation, such as Stationery › Notebooks. A Product sits in exactly one.
_Avoid_: Department, section

**Brand**:
The manufacturer of a Product.
_Avoid_: Make, vendor

**Tag**:
A cross-cutting label in a tag group, such as "School prep" or `new-arrival`. Filters combine tags in one group with OR and tags in different groups with AND.
_Avoid_: Label, keyword

**New Arrival**:
A Product carrying the `new-arrival` tag. Its age plays no part.
_Avoid_: New product, recent product

**Collection**:
A marketing grouping with its own page, filled by the products that carry any of its tags. A gift guide is a Collection.
_Avoid_: Gift guide (as a separate concept), curated list

**Attribute**:
A named, typed property such as colour or paper weight, whose values sit on variants. Attributes drive storefront filters and School Supply List Specifications.
_Avoid_: Property, feature, option

**Active / Inactive** (catalogue status):
Whether a Product, Product Variant, Category, Brand, Tag, Collection or Warehouse is in use. Inactive things are not sold.
_Avoid_: Draft, published, enabled/disabled

### Inventory

**Warehouse**:
A physical place that holds stock. Only active warehouses are sold from.
_Avoid_: Store, location, branch

**Stock Balance**:
The units of one variant physically in one warehouse, and how many of them are held by Stock Reservations.
_Avoid_: Inventory row, stock record

**Available Stock**:
What can still be sold of a variant: units on hand minus units reserved, over its active warehouses, never below zero.
_Avoid_: Stock, quantity, on hand

**Stock Level**:
How a variant's Available Stock reads to a Customer: out of stock (none), low stock (1 to 5 units) or in stock.
_Avoid_: Availability flag

**Stock Reservation**:
Units held for an accepted Order at a specific warehouse, from Order Acceptance until they are consumed at delivery or released on cancellation.
_Avoid_: Allocation, hold

### Customers, Cart and Orders

**Customer**:
A person who shops on the storefront, whether browsing generally or fulfilling a School Supply List. A Customer may shop as a Guest.
_Avoid_: Parent, buyer, account

**Guest**:
A Customer who buys without an account, giving an email and a phone number for the Order.
_Avoid_: Anonymous user, visitor

**Staff**:
A FindEg employee who runs the business from the dashboard: the catalogue, Orders, partners and School Supply Lists.
_Avoid_: Admin, operator, Partner Administrator

**Money**:
An amount in Egyptian pounds with exactly two decimals, such as 12.00 or 12.99. It is never negative. Prices include VAT.
_Avoid_: Price (for amounts that are not a price), piasters (in business language)

**Cart**:
The catalogue variants and quantities a Customer intends to buy. It carries no prices and never holds School Supply List lines.
_Avoid_: Basket, bag, List Selection

**Quote**:
FindEg's authoritative pricing of a set of lines at a moment in time: unit prices, per-line discounts tagged by their source, line totals, the flat shipping fee and the total.
_Avoid_: Estimate, cart total

**Order Totals**:
The money of a Quote or Order: the gross subtotal before discounts, the discount, the net subtotal after it, the shipping fee and the total (net subtotal plus shipping).
_Avoid_: Price summary, grand total

**Confirmation**:
The terms of a Quote that the Customer agrees to: its lines, discounts, List Offer, list, shipping, total and currency. An Order is accepted only if a fresh Quote has the same terms; otherwise the Customer must reconfirm.
_Avoid_: Price token, checksum

**Order**:
A Customer's accepted purchase, from either the Cart or exactly one School Supply List, never both. Its lines, prices and attribution are frozen at Order Acceptance.
_Avoid_: Purchase, transaction, basket

**Order Acceptance**:
The single all-or-nothing moment an Order comes into existence: re-priced, stock reserved, prices and attribution frozen. It is not an Order Status.
_Avoid_: Order placement, order creation, confirmed order

**Order Reference**:
The short, public, human-readable identifier of an Order, used by Customers, couriers and support: `FE-` plus 6 characters. It is not a secret.
_Avoid_: Order number, order id, tracking code

**Order Status**:
Where an Order is in fulfilment: pending, confirmed, processing, shipped, delivered, cancelled or refunded. **Confirmed** means Staff phoned the Customer and the Customer confirmed the Order, and Customers see it.
_Avoid_: Order state, Payment Status

**Live Order**:
An Order that is neither cancelled nor refunded. Only Live Orders count in Partner Reports.
_Avoid_: Valid order, active order

**Payment Status**:
Whether an Order's money has been collected: unpaid, paid or refunded. An Order becomes paid only once delivered, and is refunded only together with its Order.
_Avoid_: Payment state, Order Status

**Cancellation**:
Stopping an Order before delivery, including a parcel refused at the door or returned. It releases the Order's Stock Reservation; a shipped Order is cancelled only once Staff state that the parcel is back in the warehouse.
_Avoid_: Refund (before delivery), void

**Refund**:
Returning a Customer's money for a delivered, paid Order: the Order and its payment both become refunded, together. It has no stock effect; returned goods are restocked by a manual inventory adjustment.
_Avoid_: Cancellation, return

### Business Partners

**Business Partner**:
An organization FindEg has a commercial relationship with. A Partner School is one kind of Business Partner. It is always in one Business Partner Status.
_Avoid_: Partner (ambiguous alone; always qualify: Partner School, etc.)

**Business Partner Status**:
Where a Business Partner stands in its relationship with FindEg: **Onboarding** (being set up; its code can still change), **Active** (live), **Suspended** (temporarily paused by Staff, reversible) or **Closed** (the relationship has ended, permanently). It governs only the Partner's own access and Staff list authoring; Customers, School Supply Lists and Orders behave the same in every status.
_Avoid_: Partner state, enabled/disabled

**Partner Code**:
A Business Partner's short code, used in its Partner Workspace address. It can change only while the partner is onboarding.
_Avoid_: Slug, handle

**Partner Membership**:
A person's standing inside one Business Partner: which Partner Roles they hold and whether it is active, suspended or ended. It is per Business Partner and separate from Staff access, so the same person can be a Customer and a Partner Administrator.
_Avoid_: Partner account, partner login, organization membership

**Partner Role**:
One of four fixed responsibilities a Partner Membership can hold, several at once: partner administrator, list manager, collection staff, report viewer. List manager and collection staff can be held but grant nothing yet.
_Avoid_: Permission, Staff Role

**Partner Administrator**:
A member holding the partner administrator Partner Role: the only role that manages invitations and memberships. Every Business Partner that is not closed always keeps at least one active Partner Administrator.
_Avoid_: Partner admin, owner

**Partner Invitation**:
An emailed offer to join a Business Partner with specific Partner Roles, valid for 7 days from when it was last sent. Opening its link never accepts it: the invitee signs in with the invited email and explicitly accepts.
_Avoid_: Partner invite link, signup link

**Partner Workspace**:
The storefront area where members work on behalf of their Business Partner. Non-members see it as not found.
_Avoid_: Partner portal, partner dashboard

**Partner School**:
A Business Partner that is a school: the organization a School Supply List is published for. A Business Partner becomes a Partner School when it is given a Partner School Profile, and stays one. The Partner School directory lists only schools with at least one published list.
_Avoid_: School (ambiguous; a school is always a kind of Business Partner, never a standalone entity)

**Partner School Profile**:
The school-specific details of a Partner School (governorate, area, school type, academic system, optional logo) shown in the Partner School directory. Maintained by Staff.
_Avoid_: School profile, school record

### School Supply Lists

**School Supply List**:
A curated list of items a Partner School asks its Customers to buy, for one academic year and grade, moving through Draft, Published and Archived. Customers reach it through its Public Code rather than a login.
_Avoid_: School List, Parent List

**Draft / Published / Archived** (School Supply List status):
A School Supply List's lifecycle state. Draft is freely editable. Published freezes its items, Specifications, default variants and quantities. Archived means superseded by a List Replacement or otherwise retired: still viewable, never checkoutable again.
_Avoid_: Active/inactive (conflates status with visibility)

**School Supply List Item**:
One line of a School Supply List: a default variant, a prescribed quantity, required or optional, and either no Specification (an Exact Item) or a Specification its choices must match. An unfinished Draft may lack its default variant; publishing requires it, and every published item has one.
_Avoid_: School List Item

**Exact Item**:
A School Supply List Item with no Specification: only its default variant is accepted.
_Avoid_: Fixed item

**Specification**:
What a non-exact list item asks for: one category plus attribute values. It is frozen when the list is published.
_Avoid_: Requirement, criteria

**Allowed Alternative**:
An active variant of an active product in exactly the Specification's category, carrying every specified attribute value, computed when the Customer chooses rather than pre-picked by Staff.
_Avoid_: Curated alternative

**Substitute**:
A list line whose chosen variant is not its item's default variant.
_Avoid_: Replacement (that is a List Replacement), swap

**Slot**:
The place a published list occupies: one Partner School, one academic year, one grade. A slot holds at most one published list.
_Avoid_: Position, grade list

**Public Code**:
The long, unguessable code in a published list's link. Holding it is the only way to reach the list.
_Avoid_: List id, share code, password

**List Replacement**:
A newly published list that takes over its source's Slot. The source becomes Archived and the new list inherits its List Offer. A copy published into another slot replaces nothing, and an older copy never displaces a newer list.
_Avoid_: List update, new version (on its own)

**List Offer**:
A percentage discount on one School Supply List, active from its start until its end, or with no end when none is set. A list has at most one, and it applies to every line bought from the list, Substitutes included, whether or not the selection is complete.
_Avoid_: List discount, coupon, promotion

**List Selection**:
A Customer's in-progress choices against one published School Supply List (a variant and quantity per list item), kept apart from the Cart and from every other list, and checked out as its own Order. A choice that stops being allowed is flagged for the Customer to choose again, and blocks checkout until they do.
_Avoid_: Cart, list cart, cart kit, kit, list session

**List Completeness**:
Whether a List Selection covers every required list item at its prescribed quantity, with any Allowed Alternative counting. It is advisory: it never blocks checkout and never changes the List Offer.
_Avoid_: List validation, list progress

### Partner Sales

**Attributed Order**:
An Order placed from a School Supply List, recording that list, its Public Code and its Partner School's Business Partner. It is the only link between a Business Partner and Orders.
_Avoid_: Partner order, referral, commission order

**Partner Report**:
What a Business Partner's members see of the sales from its School Supply Lists: quantities and amounts per month, list, item and variant, in Cairo time, over Live Orders only. A row built from fewer than 3 distinct Orders is folded into "Other items", and the report never shows a Customer, an Order Reference or an Order count.
_Avoid_: Dashboard, analytics, statement

## Application terms

Terms of the software that runs the business, not of the business itself. The domain package never exports them.

**Idempotency Key**:
A client-chosen key that makes retrying an Order Acceptance return the original result instead of a second Order.
_Avoid_: Request id, nonce

**Guest Order Access**:
How a Guest views their Order: they give its Order Reference and email, and prove it with a one-time code sent to that email on request.
_Avoid_: Order tracking, guest login

**Outbox**:
The durable record of messages that must be sent because something was committed, written in the same transaction and delivered afterwards, at least once.
_Avoid_: Queue, notification log, email jobs

**Package Boundary**:
The public import surface and dependency direction of a workspace package. Consumers import only declared public entries; implementation files remain private, and package dependency edges stay acyclic.
_Avoid_: Deep import, internal API

**Domain Package**:
`@findeg/domain`: the one place FindEg's business values, entities, relations and rules are declared, pure and free of application concerns. Every other layer maps to it; none redeclares what it holds.
_Avoid_: Business Domain Schema, shared types, enums file, constants
