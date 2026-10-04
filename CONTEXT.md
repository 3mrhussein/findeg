# FindEg

FindEg is an Egyptian school-supplies store: Customers buy ordinary catalog items or fill a Partner School's School Supply List, paying cash on delivery.

## Language

### Customers and School Supply Lists

**Customer**:
A person who shops on the storefront, whether browsing generally or fulfilling a School Supply List.
_Avoid_: Parent, buyer, account

**Business Partner**:
An organization the platform has a commercial relationship with. A Partner School is one kind of Business Partner. It is always in one Business Partner Status.
_Avoid_: Partner (ambiguous alone — always qualify: Partner School, etc.)

**Business Partner Status**:
Where a Business Partner stands in its relationship with FindEg: **Onboarding** (being set up; its code can still change), **Active** (live), **Suspended** (temporarily paused by Staff, reversible) or **Closed** (the relationship has ended, permanently). It governs only the Partner's own access to its Partner Workspace and list publishing; Customers, School Supply Lists and Orders behave the same in every status.
_Avoid_: Partner state, enabled/disabled

**Partner School**:
A Business Partner that is a school: the entity a School Supply List is published on behalf of. A Business Partner becomes a Partner School when it is given a Partner School Profile, and stays one.
_Avoid_: School (ambiguous — a school is always a kind of Business Partner, never a standalone entity)

**Partner School Profile**:
The school-specific details of a Partner School (governorate, area, school type, academic system, logo) shown in the Partner School directory. Maintained by FindEg Staff.
_Avoid_: School profile, school record

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
A newly published School Supply List that supersedes the currently published source for the same Partner School, academic year and grade, via a replacement chain (source → replaces → replaced-by). The superseded list becomes Archived: still viewable, no longer checkoutable. A clone published for another grade or year copies its source's content without replacing or archiving that source.
_Avoid_: —

**Draft / Published / Archived** (School Supply List status):
A School Supply List's lifecycle state. Draft is freely editable. Published freezes its List Item Specifications, default product variants, and quantities — enforced below the application layer, not just by convention. Archived means superseded by a List Replacement or otherwise retired; still historically viewable, never checkoutable again.
_Avoid_: Active/inactive (conflates status with visibility)

**List Selection**:
A Customer's in-progress choices against one published School Supply List (a variant and quantity per list item), kept apart from the Cart and from every other list, and checked out as its own Order.
_Avoid_: Cart, list cart, cart kit, kit, list session

**List Completeness**:
Whether a List Selection covers every required list item at its prescribed quantity, with any eligible substitute counting. It is advisory and never blocks checkout.
_Avoid_: List validation, list progress

### Partner Membership

**Partner Membership**:
A person's standing inside one Business Partner: which Partner Roles they hold and whether it is active, suspended or ended. It is per Business Partner and never changes the person's account-wide portal role, so the same person can be a Customer and a Partner Administrator. It is separate from Staff access control.
_Avoid_: Partner account, partner login, organization membership

**Partner Role**:
One of four fixed responsibilities a Partner Membership can hold, several at once: `partner-administrator`, `list-manager`, `collection-staff`, `report-viewer`.
_Avoid_: Permission, Staff Role

**Partner Administrator**:
A member holding the `partner-administrator` Partner Role: the only role that manages invitations and memberships. Every Business Partner that is not closed always keeps at least one active Partner Administrator.
_Avoid_: Partner admin, owner

**Partner Invitation**:
An emailed, 7-day offer to join a Business Partner with specific Partner Roles. Opening its link never accepts it: the invitee signs in with the invited email and explicitly accepts.
_Avoid_: Partner invite link, signup link

**Partner Workspace**:
The storefront area at `/[locale]/partner/[code]` where members work on behalf of their Business Partner. Non-members see it as not found.
_Avoid_: Partner portal, partner dashboard

### Checkout

**Quote**:
The server's authoritative pricing of a set of lines (unit prices, discounts, shipping, total) at a moment in time, carrying a Confirmation. Discounts are per-line entries tagged by their source (currently only the List Offer).
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

**Guest Order Access**:
How a Customer without an account views their Order: they give its Order Reference and email, and prove it with a one-time code sent to that email on request.
_Avoid_: Order tracking, guest login

**Outbox**:
The durable record of messages that must be sent because something was committed, written in the same transaction and delivered afterwards, at least once.
_Avoid_: Queue, notification log, email jobs

**Order Reference**:
The short, public, human-readable identifier of an Order, used by Customers, couriers, and support. Its format is `FE-` plus 6 character### Partner Sales

**Attributed Order**:
An Order placed from a School Supply List, recording that list and its Partner School's Business Partner. It is the only link between a Business Partner and Orders; rewarding schools is a future FindEg Staff calculation over Attributed Orders.
_Avoid_: Partner order, referral, commission order

**Partner Report**:
What a Business Partner's members see of the sales from its School Supply Lists, in monthly aggregates. It never identifies a Customer or an Order.
_Avoid_: Dashboard, analytics, statement

and the debt is offset by later earnings.
_Avoid_: Wallet balance, credit

### Inventory

**Stock Reservation**:
Units held for an accepted Order at a specific warehouse, from Order Acceptance until they are consumed at delivery or released on cancellation.
_Avoid_: Allocation, hold
