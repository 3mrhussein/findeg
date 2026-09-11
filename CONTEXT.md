# FindEg

FindEg is an Egyptian stationery retailer that owns its catalog and fulfillment. It also provides Business Partners with software for preparing and sharing curated lists that Customers can shop through FindEg; Partner Schools are the only phase-one partner type.

## Language

**FindEg**:
The Egyptian retailer that owns the product catalog, sells to Customers in EGP, and fulfills their orders while operating the partner-list service in Arabic and English.
_Avoid_: Marketplace, vendor platform

**Customer**:
A person who shops from FindEg and places an order, either through the general stationery store or from a School Supply List. A Customer may use Guest Checkout or an optional User account.
_Avoid_: Consumer, buyer, account

**Business Partner**:
An organization authorized by FindEg to prepare shoppable lists and accrue Partner Points from qualifying sales attributed to those lists. Partner Schools are the only phase-one Business Partners.
_Avoid_: Vendor, seller, tenant, business account

**Partner School**:
A Business Partner that prepares and shares official School Supply Lists for its classes. It does not sell, price, pack, ship, or accept payment for products, but it may act as a collection point for Orders fulfilled by FindEg.
_Avoid_: Vendor, seller, school account

**Partner Membership**:
The durable relationship authorizing a User to act for one Business Partner through the Partner Workspace. It begins when an invitation is accepted, may be active, suspended, or ended, and does not reduce the User's other portal eligibility.
_Avoid_: Partner user, school staff account

**Partner Invitation**:
A single-use, expiring invitation for a verified User to receive specified Partner Roles in one Business Partner. Acceptance creates an active Partner Membership rather than granting access through the invitation itself.
_Avoid_: Pending member, school account invitation

**Partner Role**:
A fixed, additive grant attached to one Partner Membership and evaluated only within that membership's Business Partner. Phase-one Partner Roles are Partner Administrator, List Manager, Collection Staff, and Report Viewer.
_Avoid_: Portal role, school-wide permission

**Partner Workspace**:
The Business Partner-facing portal where authorized people prepare and share lists and monitor purchases attributed to them.
_Avoid_: School dashboard, business account

**School Supply List**:
A Partner School's reusable selection of required and optional stationery specifications, default FindEg Product Variants, and quantities for an academic year and grade/year level, optionally narrowed to a class or section. It is mutable only while Draft; publishing freezes it, Customers purchase through a dedicated List Selection and checkout, and later changes require a cloned Draft.
_Avoid_: Cart, product bundle, marketplace listing

**School Supply List Item**:
An entry that defines a List Item Specification, a default matching Product Variant, and a quantity as required or optional. Alternatives are derived from the specification unless the Partner School marks the entry as an Exact Item.

**List Item Specification**:
The catalog category and exact Product Attribute values a Partner School requires for a School Supply List Item. It is frozen when the list is published and determines which Product Variants satisfy the item.
_Avoid_: Item parameters, product filter

**Exact Item**:
A School Supply List Item that may be removed from a List Selection but cannot be satisfied by a different Product Variant.
_Avoid_: Locked item, uneditable item

**Allowed Alternative**:
A distinct active Product Variant whose category and values for every specified Product Attribute exactly match a published non-exact item's List Item Specification. Unspecified attributes, brand, and current price may differ and must be displayed prominently.
_Avoid_: Automatic substitution

**List Offer**:
A percentage discount promotion controlled by FindEg, attached to one specific School Supply List, and funded from FindEg's margin. It applies without a completeness or quantity requirement to every purchase through the list, including optional items and Allowed Alternatives.
_Avoid_: Wholesale price, partner-funded discount

**Archived School Supply List**:
An inactive School Supply List retained for viewing and historical Order references but unavailable for checkout. Its archival reason distinguishes outdated, replaced, school-archived, and FindEg-withdrawn lists.
_Avoid_: Deleted list

**List Replacement**:
A newly published School Supply List cloned to correct or supersede an immutable published list for the same school, academic year, grade, and class or section. Publishing it archives the previous list, whose page remains viewable and points Customers to the replacement.
_Avoid_: List revision, published edit

**Unlisted List Access**:
The phase-one publication mode for a School Supply List: possession of its link, code, or QR code is sufficient to open it, but the list is not publicly discoverable.
_Avoid_: Private list, public directory

**Cart**:
A Customer's mutable selection of ordinary Storefront Product Variants and quantities before Storefront checkout. School Supply List purchases use a separate List Selection.
_Avoid_: School Supply List, List Selection

**List Selection**:
A Customer's resumable, mutable choices for purchasing from one published School Supply List through its dedicated checkout. It never merges with a Cart or another list, and becomes view-only and uncheckoutable if its source list is archived or replaced.
_Avoid_: Cart, List Cart Group, list as a Cart item

**List Completeness**:
The advisory degree to which a Customer's editable List Selection still satisfies the required List Item Specifications and quantities selected by a School Supply List. A deliberately chosen Allowed Alternative satisfies its item; optional list items do not affect completeness, and incompleteness never blocks checkout.

**Guest Checkout**:
A checkout in which the Customer supplies contact and delivery information without creating a User account.
_Avoid_: Anonymous order

**Guest Order Access**:
Secure retrieval of a Guest Checkout Order using an opaque reference and a one-time code sent to the checkout email or phone. The same verification may attach the Order to a Customer's new account; an Order number or matching contact detail alone never grants access or ownership.
_Avoid_: Order-number lookup

**Inventory Hold**:
A short-lived allocation of Product Variant stock while an online card payment is attempted. It becomes an Order Reservation after successful payment and is released after failure or timeout.

**Order Reservation**:
Product Variant stock committed to an accepted Order. An online card Order receives it after successful payment, while a valid cash-on-delivery checkout is accepted immediately and receives it after stock, address, delivery-zone, and price validation.

**School Collection**:
An optional, prepaid fulfillment method that a Partner School may enable for a School Supply List at a school-managed site. FindEg controls any collection fee, ships the sealed Order there, and the school confirms handoff to the Customer using limited collection data and a one-time code.
_Avoid_: School fulfillment, cash on delivery

**Attributed Sale**:
An Order Item purchased through a Business Partner's list while retaining the list and partner responsible for the purchase.
_Avoid_: Referral click, whole attributed order

**Order Item Replacement**:
A staff-arranged, no-charge fulfillment correction for a defective Order Item using the same Product Variant or a Customer-approved variant satisfying its original List Item Specification. It does not create a new Attributed Sale or Partner Points.
_Avoid_: Exchange, new sale

**Partner Points**:
Non-cash ledger units pending for a Business Partner from discounted list merchandise under its Partner Points Rate and earned once the Attributed Sale is paid and delivered or collected. Whole Order cancellation, item-level refund, or payment reversal removes or reverses the corresponding points; monetary conversion is governed separately as a Partner Reward.
_Avoid_: Commission, cash balance

**Partner Points Rate**:
A required, effective-dated percentage controlled by FindEg for a Business Partner that determines how Partner Points accrue from eligible Attributed Sales. It may be zero, is visible to the partner, and is snapshotted by each accepted Order.

**Partner Reward**:
An EGP monetary benefit payable to a Business Partner from earned Partner Points using the Partner Reward Conversion Rate fixed when the originating Order was accepted. FindEg initiates monthly settlements subject to staff approval.
_Avoid_: Commission, Customer discount

**Partner Reward Conversion Rate**:
The shared, effective-dated EGP value of one Partner Point, explicitly configured by FindEg and fixed for an Attributed Sale when its Order is accepted. Changes apply to future Orders without changing the value promised for previously accepted Orders.

**Partner Reward Settlement**:
A FindEg-initiated allocation of a Business Partner's eligible earned rewards and adjustments for an approved EGP payout to its verified bank account. Suspension holds payouts without forfeiting rewards; completed payouts remain historical facts when later adjustments arise.

**Partner Reward Statement**:
A Business Partner's monthly reconciliation of reward balances, earned points and their monetary value, reversals, adjustments, payouts, and held amounts. It is visible to Partner Administrators and Report Viewers without exposing individual Customer Orders.

**Partner Report**:
A privacy-limited aggregate of a Business Partner's lists, Attributed Sales, Partner Points, and Partner Rewards without Customer identity, contact, or delivery information. Financial totals remain reconcilable while low-count day, list-item, and Product Variant breakdowns are suppressed.
_Avoid_: Customer report, order export

**Current Session**:
The authenticated identity and authorization context attached to one browser request. It represents the active User, Active Portal, selected Business Partner when using the Partner Workspace, and grants valid for that context.
_Avoid_: login state, auth context

**Active Portal**:
The single portal a User explicitly accesses for one request through a Current Session. The same User may access different eligible portals in separate tabs without changing another tab's context.

**FindEg Staff Role**:
A fixed, additive grant authorizing a User to perform specified FindEg Back Office work: Access Administrator, Catalog Manager, Fulfillment Operator, Partner Manager, or Finance Manager. It is separate from Partner Roles and does not grant access through a Partner Membership.
_Avoid_: Portal role, superuser

**Session Invalidation**:
The loss of an authenticated Current Session because its session has expired or been revoked, or its User is no longer active. A change in permissions alone refreshes access rather than signing the User out.

**Authorization Denial**:
A valid Current Session lacks permission for a requested operation. It does not remove the Current Session or sign the User out.

**Authorization Version**:
A User-specific version of their active and granted access. It changes when access-affecting facts change, making a Current Session’s authorization context stale.
