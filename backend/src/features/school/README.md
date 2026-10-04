# School Supply Lists

`createSchoolSupplyListService()` is the Staff-callable lifecycle interface for
School Supply Lists owned by Partner Schools (ADR-0004, spec #206, slice #210).
It accepts a resolved Staff session and an optional injected database/clock.
Write operations require `admin.schoollists.write` or `system_admin`; reads
also accept `admin.schoollists.read`. Partner Roles grant no lifecycle access.
The authenticated administration adapters are the next slice, #211.

The Partner School must have a `partner_school_profiles` row for its Business
Partner. School profile attributes live there, rather than being repeated on lists.

## Lifecycle

- `createDraft`, `updateDraft`, `addItem`, `updateItem`, `removeItem` and
  `reorderItems` prepare a draft. Reordering takes every item ID exactly once.
- `publish` rejects an empty list, a missing/inactive default, a default that
  fails `eligibleVariants`, or an occupied school/year/grade slot. It returns
  out-of-stock warnings without blocking publication. Stock means `onHand -
 reserved`, summed across active warehouses.
- Publication generates a unique 32-character UUID-derived public code and
  snapshots each item's English/Arabic product names and SKU, never its price.
- `cloneToDraft` copies a published or archived version's content and items,
  retaining `sourceListId`, with fresh item IDs and no code or snapshots. Grade
  and academic year can be changed while cloning or editing the draft.
- Publishing a clone into the slot still held by its source archives that
  source atomically and sets both `replacesListId` and `replacedById`. A clone
  targeting another free slot publishes independently. A clone of an older
  version cannot displace a newer occupant of the slot.
- `archive` retires a published list without a replacement and frees its slot.
  Archived versions remain readable and cannot be un-archived; clone instead.
- The owning Business Partner's status gates authoring (ADR-0012): `publish`
  (including a replacement) needs `onboarding` or `active`; `createDraft`,
  `cloneToDraft` and every draft edit are refused once it is `closed`. Both
  return `partner-status-not-allowed`. The check reads the Business Partner row
  under the lifecycle's Partner School lock, so a concurrent status change
  waits for it.
  Archiving, reads and List Offers ignore the status.

Every operation returns a typed `SupplyListResult`: success carries `data`,
expected business rejections carry `error`, and technical failures throw.
All mutations use one transaction. The Partner School row lock serializes slot
changes, the list lock protects edits versus publication, and the unique slot
index protects concurrent writers. Database triggers freeze non-draft lists
and their items, including direct SQL inserts, edits, moves and deletes. Only
the list's archival transition and `updatedAt` remain writable.

## Public read (#212)

`createSchoolSupplyListReader().getByPublicCode(code)` is the anonymous, live
read behind `/lists/[publicCode]`. Draft, unknown and malformed codes return
`not-found`; archived lists return `replacementPublicCode` when replaced. Each
item carries its default and `eligibleVariants` (inactive variants excluded)
with price, brand, `differingAttributes` against the default and an `inStock`
flag (available quantity across active warehouses is at least 1, from one batch
query). `offer` is reserved and always `null` until the List Offer spec.
`ListCheckoutRequest` records the list-checkout contract for the checkout spec.

## Partner School directory (#217)

`createSchoolDirectory()` backs `/schools`. It reads Business Partners that
have a `partner_school_profiles` row, whatever their status (ADR-0012);
non-school partners are hidden. `searchSchools` matches the
English or Arabic name, filters by governorate, school type and academic
system, optionally only schools with a published list, and pages by English
name. `getByCode(code)` returns the school profile with its published lists
only, each carrying the `publicCode` behind `/lists/<publicCode>`; drafts and
archived lists never appear, and a school with none returns an empty `lists`.
`getFilterOptions` returns the distinct Partner School profile values.

## Migration

Migration `0006_school_supply_list_lifecycle.sql` adds the lifecycle tables.
Apply the migration history, rather than only `db:push`, to install the freeze
triggers. Migration `0008_drop_legacy_school_lists.sql` is the contract step:
it drops `school_lists`, `school_list_items`, `school_list_item_alternatives`,
`school_list_parent_sessions`, `cart_kits` and `order_items.cart_kit_id`. No
production data existed for them (ADR-0004), so nothing is copied. The access
and approval apparatus went in #216: possession of the `publicCode` is the only
gate to a list.

The shared pure `eligibleVariants` function and catalog candidate/attribute
queries from #208 serve this lifecycle and the later read/checkout paths.

## Verification

Run `pnpm test:integration` against PostgreSQL 16 using
`INTEGRATION_DATABASE_URL`, or the repository's local database configuration.
The lifecycle tests exercise the public feature interface, real migrations,
bilingual snapshots, validation, stock warnings, rollback, freeze triggers via
direct SQL, slot/code constraints and concurrent publication/replacement.
