---
status: proposed
---

# School Supply List: vocabulary rename, lifecycle, and substitution model

Main's `school_lists` feature predates issue #50's School Supply List domain and diverges from it structurally, not just terminologically: there is no draft/publish/replace lifecycle (only `isActive`/`publishedAt`), substitution is an admin-curated join table rather than a computed eligibility rule, and "School" is denormalized free text on each list row (`school_lists.schoolName`/`governorate`/`area`/`schoolType`/`academicSystem` — `db/src/schema/school-engine/school-lists.ts:28-66`) rather than a referenced entity. `develop` (mined as reference only, per the parent map) solved the same problem with a different, incompatible mechanism in each case. We decide here how main adopts develop's concepts, translated into main's own feature-barrel/Drizzle conventions, and do the vocabulary rename in the same change as the behavior it belongs to.

This ADR depends on ADR-0003 (Partner Membership Model, not yet merged): the `businessPartnerId` FK below references the `businessPartners` table ADR-0003 introduces. This ticket cannot land before ADR-0003 does.

## Decisions

**School becomes a Partner School, a real entity.** Today "school" is repeated free text with no FK. `school_supply_lists.businessPartnerId` references `businessPartners`; school-specific attributes (governorate, area, schoolType, academicSystem) move to a `partnerSchoolProfiles` side table keyed by `businessPartnerId`. `SchoolDirectoryService`'s public browse surface is rewritten to read the new entity instead of grouping denormalized list rows.

**Lifecycle is `draft → published → archived`**, with `sourceListId`/`replacesListId`/`replacedById` threading the clone → publish → supersede chain (mirroring develop's shape, reimplemented fresh — not lifted from develop's module code). At publish, commercial fields (product name en/ar, SKU, unit price) are snapshotted onto each item from the live catalog variant. Immutability of non-draft rows is enforced in two layers: the feature service is the primary, readable rule (reject writes to non-draft lists/items), backstopped by a Postgres trigger (`freeze_supply_list`/`freeze_supply_list_item`, modeled on develop's migration 0007) that raises on any UPDATE/DELETE except the narrow status-transition columns (`status`, `replacedById`, `archivedAt`, `updatedAt`). Two layers because a service-only guard can be bypassed by any future write path that forgets to call it; the trigger is the guarantee, the service check is the one a reader will actually see.

**Substitution is computed, not curated.** Each `school_supply_list_item` gets `exactItem: boolean` and `specification: jsonb<{categoryId, attributes}>`; eligible variants are computed at selection time against the frozen specification, not pre-selected by an admin. `schoolListItemAlternatives` and `matchRules` are dropped entirely — no authoring-aid role retained, since keeping the table would mean two sources of truth for eligibility with no defined sync rule. `isOptional`/`quantityRequired` collapse into a single `required: boolean`.

**List Offer is deferred, not built.** `sales.list_offers` remains unmodeled here; it graduates into the parent map's "Not yet specified" once the checkout/COD design ticket exists to inform how a per-list discount interacts with cart totals and other discounts.

**Unlisted access: only the `publicCode` column lands here.** Publish generates a unique, high-entropy `publicCode` (mirroring develop's `crypto.randomUUID().replaceAll('-', '')`) on `school_supply_lists`, since publish is what needs to produce it. Removing main's existing four-table ACL/approval/lockout apparatus (`school_list_access_grants`/`_requests`/`_tokens`/`_code_attempts`, including the unfinished `SchoolAccessService.verifyCode()` stub) is a separate decision with its own blast radius and gets its own ticket, not bundled here.

**Migration is greenfield.** No production data exists for this feature (`ParentListService` and `SchoolAccessService.verifyCode()` are confirmed unimplemented stubs), so the migration drops and recreates `school_lists` → `school_supply_lists`, `school_list_items` → `school_supply_list_items`, drops `school_list_item_alternatives`, and drops `school_list_parent_sessions` (the real name of what was loosely called `school_list_sessions`) along with `cart_kits` and `order_items.cart_kit_id`. No `list_selections` table replaces them: a List Selection is held on the client and posted to checkout as lines (ADR-0011, which superseded the develop-shaped `owner_digest` + `list_id` table first planned here). `ParentListService.addListToCart`'s sketched merge-into-`cart_kit` design is explicitly discarded — it contradicts List Selection never merging with the ordinary Cart. The full vocabulary rename (Parent → Customer, School → Partner School, etc.) happens in this same migration/PR, not as a separate mechanical pass.

## Considered options

- **Keep main's curated-alternatives table as the runtime source of truth**, modeling Exact Item as an item with exactly one curated alternative. Rejected: it can't express "any variant matching this specification," which is the actual requirement, and it would leave the concept doing something narrower than its name implies.
- **Application-layer-only immutability, no DB trigger.** Simpler, keeps all logic in one place (main's Drizzle conventions favor this). Rejected in favor of trigger-as-backstop: every write path already goes through the service today, but that's an invariant about the current codebase, not a guarantee, and a frozen List Item Specification is exactly the kind of correctness property worth enforcing below the application layer.
- **Retain the ACL apparatus alongside `publicCode`** (gated access for lists that opt in, opaque code for the common path). Rejected: retaining an approval workflow that was never finished (`verifyCode()` is a stub) is how dead code becomes permanent; if gated access is wanted later it can be reintroduced deliberately.
- **Build List Offer now** since it's named in the parent ticket. Rejected: its data shape is trivial but its application (interaction with cart totals, other discounts, atomic COD) depends on checkout decisions not yet made; specifying it prematurely risks getting the interaction wrong.

## Consequences

- This ADR cannot be implemented before ADR-0003's `businessPartners` table lands.
- A follow-up ticket ("Remove School List ACL/approval apparatus in favor of publicCode possession-based access") is needed to actually delete `school_list_access_grants`/`_requests`/`_tokens`/`_code_attempts`; until it lands, both mechanisms exist side by side, with the ACL path dead but not deleted.
- List Offer stays unspecified until the checkout/COD design ticket exists; any UI or copy referencing "list offers" before then has nothing to bind to.
