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

Every operation returns a typed `SupplyListResult`: success carries `data`,
expected business rejections carry `error`, and technical failures throw.
All mutations use one transaction. The Partner School row lock serializes slot
changes, the list lock protects edits versus publication, and the unique slot
index protects concurrent writers. Database triggers freeze non-draft lists
and their items, including direct SQL inserts, edits, moves and deletes. Only
the list's archival transition and `updatedAt` remain writable.

## Migration and remaining slices

Migration `0006_school_supply_list_lifecycle.sql` adds the new tables beside
the legacy tables. Apply the migration history, rather than only `db:push`,
to install the freeze triggers. No development data is copied or removed.
The legacy directory, access and Parent List interfaces still serve their
existing callers during this transition. They are replaced by #212 (public
code read), #216 (ACL removal) and #217 (Partner School directory and legacy
table removal); the new lifecycle never writes those legacy tables.

The legacy `school_lists`/`school_list_items` rows contain denormalized school
profiles and curated alternatives. Their access grants, requests, tokens and
parent-session scaffolding belong to the older interfaces; `verifyCode` and
Parent List operations remain unfinished stubs. These are retained dependencies
of the old callers, rather than behavior provided by the new lifecycle.

The shared pure `eligibleVariants` function and catalog candidate/attribute
queries from #208 serve this lifecycle and the later read/checkout paths.
Customer routes, selection, checkout, List Offers and authoring UI are outside
#210.

## Verification

Run `pnpm test:integration` against PostgreSQL 16 using
`INTEGRATION_DATABASE_URL`, or the repository's local database configuration.
The lifecycle tests exercise the public feature interface, real migrations,
bilingual snapshots, validation, stock warnings, rollback, freeze triggers via
direct SQL, slot/code constraints and concurrent publication/replacement.
