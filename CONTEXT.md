# Findeg

An e-commerce platform connecting Customers to Partner Schools' supply lists, plus general storefront shopping.

## Language

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
