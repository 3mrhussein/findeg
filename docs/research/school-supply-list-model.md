# Research: develop's School Supply List domain model vs main's Parent/School feature

Part of #146. Answers #149. Feeds #150 (lifecycle design ticket).

Method: read-only comparison via `git show <branch>:<path>`, `git log --grep`, and `gh issue/pr view`. No code ported; `develop` is reference-only per #146.

## Sources

- Issue #50 (user stories 15-17 on Draft/Published/List Replacement; stories 3-9 on unlisted access, List Selection, Allowed Alternative/Exact Item, List Offer).
- develop commits: `96be3c30` / `e0042a21` ("feat/fix: shop School Supply Lists through dedicated selections (#60)"), `fafef9d0` ("Add dedicated school supply list selections (#79)", merges #60 work), `bc409f67` (#59, outbox), `0624f8ca` (#58, guest COD).
- develop schema: `db/src/schema/school-engine/school-list-publications.ts`, `db/migrations/0004_school_supply_list_publications.sql`, `db/migrations/0007_list_selections.sql`, `db/migrations/0014_school_supply_list_class_section.sql`.
- develop application: `backend/src/modules/school-supply-lists/{contracts,public}.ts`, `backend/src/modules/school-supply-lists/infrastructure/persistence.ts`, `backend/src/application/list-commerce.ts`, `backend/src/modules/commerce/contracts.ts`.
- main schema: `db/src/schema/school-engine/{school-lists,school-access,school-list-sessions}.ts`.
- main application: `backend/src/features/school/application/services/{ParentListService,SchoolAccessService,SchoolDirectoryService}.ts`, `backend/src/features/catalog/application/services/SchoolListService.ts`, `backend/src/features/school/README.md`.
- main cart: `backend/src/features/cart/` (`CartService.ts`, `Cart.ts`).

## 1. Schema shape: lifecycle, items, alternatives, offer

### Draft -> Published -> List Replacement lifecycle (develop-only concept)

develop introduces a **new table**, `school_engine.school_supply_lists` (`db/src/schema/school-engine/school-list-publications.ts`), that main does not have in any form:

- `status text default 'draft'` constrained by a CHECK to `'draft' | 'published' | 'archived'` (migration `0004_school_supply_list_publications.sql`).
- `sourceListId` / `replacesListId` / `replacedById` self-referencing integer columns that thread the clone -> publish -> supersede chain from story 17 ("clone a published list ... publish a List Replacement").
- `publicCode` (unique) + `publishedAt` for the unlisted-access surface (see §2).
- **Database-enforced immutability**, not just application-level checks: migration `0007_list_selections.sql` adds two Postgres trigger functions, `freeze_supply_list_item` and `freeze_supply_list`, that raise an exception on any UPDATE/DELETE to a non-`draft` list or its items except for the narrow status-transition fields (`status`, `replaced_by_id`, `archived_at`, `updated_at`). This is exactly story 16's "freeze List Item Specifications, default Product Variants, and quantities" guarantee, implemented as a DB constraint rather than convention.
- Application-level enforcement mirrors this in `backend/src/modules/school-supply-lists/public.ts`: `replaceDraft` returns `{status:'immutable'}` if `list.status !== 'draft'`, and `publish` snapshots each item's `productName`/`sku`/`unitPrice` from the live catalog variant at publish time (`infrastructure/persistence.ts`, the `publish()` function copies `snapshot.productName.en/ar`, `snapshot.sku`, `snapshot.basePrice` onto the frozen item row).
- `publish()` also handles replacement atomically: when `replacesListId` is given, the previous list is set to `status:'archived'`, `replacedById: listId`, in the same call — directly implementing story 14 ("archived or replaced list remains historically viewable but uncheckoutable").

**main has none of this.** `db/src/schema/school-engine/school-lists.ts`'s `schoolLists` table has only `isActive: boolean` and `publishedAt: timestamp` — a single mutable row with no draft/published/archived state machine, no replacement chain, and no snapshot/freeze mechanism. There is nothing to map onto "List Replacement"; it needs a new table (or a state-machine rewrite of `school_lists`) rather than an additive column.

### List Items: Allowed Alternative vs Exact Item (develop-only distinction)

develop's `school_supply_list_items` table (same file) has:
- `exactItem: integer` (boolean-as-int) — story 7, "Exact Items remain non-substitutable."
- `specification: jsonb<{categoryId, attributes}>` — the non-exact item's stated requirement (story 5/6).
- Frozen commercial fields captured at publish: `productNameEn/Ar`, `sku`, `unitPrice` (all `.default('')`/`'0'` until publish fills them in) — again the "frozen spec" guarantee.

The substitution rule itself lives in application code, not the DB: `allowedAlternatives()` in `backend/src/modules/school-supply-lists/public.ts`:
```ts
export function allowedAlternatives(item, variants) {
  return variants.filter((variant) => {
    if (item.exactItem || !item.specification) return variant.id === item.variantId;
    return (
      variant.categoryId === item.specification.categoryId &&
      Object.entries(item.specification.attributes).every(
        ([key, value]) => variant.attributes[key] === value,
      )
    );
  });
}
```
Exact items collapse to a single-variant match; non-exact items expand to every catalog variant matching the frozen category+attribute specification — giving stories 5/6/7 directly.

main's `schoolListItems` (main's `school-lists.ts`) instead has `matchRules: jsonb<MatchRulesDraft>` and a **separate table**, `schoolListItemAlternatives`, holding a curated, admin-picked list of alternative variant rows (`variantId`, `priority`, `isDefault`) per item — i.e. main's model is "admin pre-selects specific alternative SKUs," not "customer receives any catalog variant satisfying a frozen specification." These are different mechanisms: develop computes eligibility from a specification at selection time; main stores an explicit join table of admin-curated alternatives. `SchoolListService.setAlternatives()` (`backend/src/features/catalog/application/services/SchoolListService.ts`) confirms this — it takes an explicit `{variantId, isDefault}[]` array to persist, not a specification.

**Verdict**: main's `isOptional`/`quantityRequired`/`matchRules` columns partially anticipate the "required vs optional" and "match rule" ideas but the concrete Exact/Allowed-Alternative binary, and the frozen specification model, don't exist on main and aren't a clean rename — they need new columns (`exactItem`, `specification`) and dropping/reworking the curated-alternatives join table's semantics.

### List Offer (develop-only, no main equivalent)

develop's `sales.list_offers` table (migration `0007_list_selections.sql`):
```sql
CREATE TABLE sales.list_offers (
  list_id integer PRIMARY KEY REFERENCES school_engine.school_supply_lists(id),
  basis_points integer NOT NULL DEFAULT 0 CHECK (basis_points BETWEEN 0 AND 10000),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);
```
This is story 9 ("a List Offer to apply to every eligible purchase"). It's read via `stores.selections.offer(list.id)` in `backend/src/application/list-commerce.ts`. **main has nothing resembling this** — no discount/offer table scoped to a school list anywhere in `db/src/schema/school-engine/`. This is a wholly new table to add, not a rename.

### Table-by-table mapping summary

| main table | develop analog | Verdict |
|---|---|---|
| `school_engine.school_lists` | `school_engine.school_supply_lists` | Same role (the list header) but different state model — needs new lifecycle columns (`status`, `sourceListId`, `replacesListId`, `replacedById`, `publicCode`) + DB freeze triggers. Rename-and-extend is plausible, not a clean 1:1 additive change because of the freeze-immutability requirement. |
| `school_engine.school_list_items` + `school_engine.school_list_item_alternatives` | `school_engine.school_supply_list_items` | Divergent substitution model (curated join table vs frozen `specification`+`exactItem`). Needs structural change: add `exactItem`/`specification`/frozen commercial columns; the alternatives join table's purpose is superseded by computed eligibility, though it could be repurposed as an admin authoring aid for `specification`. |
| — (nothing) | `sales.list_offers` | New table. No main equivalent. |
| — (nothing) | `sales.list_selections` (see §3) | New table. No main equivalent. |
| `school_engine.school_list_sessions` | *(none directly; behavior absorbed by `list_selections`)* | main's session table is the closest existing idea to "per-customer state for a list," but see §3 — it's session/anonymous-token shaped, not a List Selection. |
| `school_engine.school_access` (grants/requests/tokens/code-attempts) | develop's `publicCode` + `readUnlisted()` | Same *idea*, different mechanism — see §2. |

## 2. Unlisted access model: "possession, not discovery"

develop's model, in full, is a single opaque, unique `publicCode` column on `school_supply_lists` (`uniqueIndex('school_supply_list_public_code')`, generated with `crypto.randomUUID().replaceAll('-', '')` at publish time in `infrastructure/persistence.ts`) plus a public read path:
```ts
async readUnlisted(code: string) {
  if (typeof code !== 'string' || code.trim().length < 16)
    return { status: 'not-found' } as const;
  const list = await store.byPublicCode(code.trim());
  return list ? ({ status: 'found', list } as const) : ({ status: 'not-found' } as const);
}
```
(`backend/src/modules/school-supply-lists/public.ts`.) There is no authentication, no per-user grant, no admin approval queue, no lockout state — access is *purely* "if you have the code/link/QR, you can read the list," matching story 3 exactly ("open ... from its link, code, or QR code, so that ... it [is] not publicly discoverable" — i.e., security by unguessability, not by ACL). `list-commerce.ts`'s `valid()` regex (`/^[a-zA-Z0-9_-]{16,128}$/`) reinforces that this is a bearer-token-shaped code, not a login.

main's `school_engine/school-access.ts` is a **much heavier, different model**: four tables — `school_list_access_grants` (per-user grant with `grantedVia`/`expiresAt`), `school_list_access_requests` (an approval-request workflow with `status: pending/approved/...`, `reviewedBy`), `school_list_access_tokens` (admin-minted tokens with `maxUses`/`useCount`/`expiresAt`), and `school_list_code_attempts` (rate-limiting/lockout state, `attemptCount`, `lockedUntil`). main's `SchoolAccessService.verifyCode()` even has a hardcoded `const isValid = false; // Placeholder for code check` — the verification logic was never implemented, only lockout/attempt bookkeeping exists. main's model is "identity-gated with an approval workflow, and a *separate* not-yet-implemented code path," not "possession of an opaque link is sufficient."

**Verdict**: these are not the same idea already implemented in two forms — main's is a heavier ACL/approval system (`accessMode` on `schoolLists` even hints at `'public'` vs other modes, unused meaningfully) whereas develop's is a single derived, high-entropy public code with no grant/request/approval state at all. Adopting story 3 on main means *removing* most of the request/approval/grant apparatus for the School Supply List surface (or demoting it to an optional, orthogonal feature) and adding an opaque `publicCode` unique column + unauthenticated read path — this is closer to a subtraction/simplification than an additive extension.

## 3. List Selection: is there an analog on main?

develop's `sales.list_selections` table (migration `0007_list_selections.sql`):
```sql
CREATE TABLE sales.list_selections (
  owner_digest text NOT NULL,
  list_id integer NOT NULL REFERENCES school_engine.school_supply_lists(id),
  selection jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_digest, list_id)
);
```
Keyed by `(owner_digest, list_id)` — one selection row per (customer, list) pair, explicitly scoped so it can never collide with the ordinary Cart or another list (story 4). `list-commerce.ts`'s `load()` shows the selection defaults from the list's *required* items (`item.required !== false`) when no prior selection exists, and `allowedAlternatives()` (from §1) gates which variant swaps are legal per item — i.e. List Selection is a cart-shaped-but-independent structure, gated by the frozen specification, never touching `commerce`'s ordinary cart contracts. `backend/src/modules/commerce/contracts.ts` explicitly documents this separation in a header comment: `/** Browser-safe ordinary Storefront commerce; List Selection has a separate contract. */`.

main's `backend/src/features/cart/` (`CartService.ts`, `Cart.ts`, `ICartService.ts`) is a single ordinary shopping cart with no concept of list scoping at all — nothing in it references `school_lists` or per-list state.

main's closest **existing** artifact is `school_engine.school_list_sessions` (`db/src/schema/school-engine/school-list-sessions.ts`, used by `sessionQueries` and `ParentListService`), and the interface `IParentListService` (`saveItemSelection`, `toggleOptionalItem`, `resetToDefaults`, `addListToCart`). However, inspecting `ParentListService.ts` shows every one of these methods is an **unimplemented stub**:
```ts
async saveItemSelection(_sessionId: number, _itemId: number, _variantId: number): Promise<void> {
  // Fetch existing session selections and update
  // sessionRepo.upsertSession(...)
}
async addListToCart(_sessionId: number, _cartId: number): Promise<void> {
  // 1. Fetch list items + session overrides
  // 2. Create cart_kit record
  // 3. Add items to cart with cart_kit_id
}
```
The comment `addListToCart` even proposes a `cart_kit_id` merge-into-cart design — the opposite of story 4's "cannot merge with my ordinary Cart." So main has a *named placeholder* for this idea (`school_list_sessions` + `IParentListService`) but zero working logic, and its sketched design (merge into Cart via a kit id) conflicts with the story develop actually implements (a dedicated, non-merging selection).

**Verdict**: main has an empty scaffold, not an analog. develop's List Selection is effectively new relative to main's real (non-stub) behavior; `school_list_sessions` could plausibly be repurposed/renamed toward `list_selections`, but its sibling `addListToCart` design intent must be discarded, and the table itself is anonymous-session/token shaped (`ParentSessionRepository`) rather than `owner_digest`-keyed for durability across guest and identified checkout as develop's is.

## 4. Vocabulary mapping (starting glossary for the rename ticket)

| main term | develop / issue #50 term | Notes |
|---|---|---|
| Parent | Customer | main's `ParentListService`, `parentName`/`parentEmail` fields → generic Customer throughout #50's stories. |
| School | Partner School (a `BusinessPartner`) | develop's `school_supply_lists.businessPartnerId` FK's into `businessPartners` (`db/src/modules/partner-management/schema.ts`) — School is modeled as one kind of Business Partner, not a standalone entity. main's `schools`/`school-directory` treats School as a first-class, non-Partner entity. |
| School List / `school_lists` | School Supply List / `school_supply_lists` | Direct rename target, but see §1 — not just a rename, needs the lifecycle columns too. |
| `school_list_items` | School Supply List Item / `school_supply_list_items` | Rename + add `exactItem`/`specification`, drop/rework `matchRules`. |
| `school_list_item_alternatives` (curated join table) | Allowed Alternative (computed via `allowedAlternatives()`) | Concept superseded by computed eligibility; table's data could seed initial `specification` values but the mechanism differs. |
| `isOptional` / `quantityRequired` | `required: boolean` on `school_supply_list_items` | Same idea, simpler modeling on develop (single boolean vs two fields). |
| `school_list_access_grants/requests/tokens/code_attempts` | `publicCode` (unlisted access) | Not a rename — a simplification down to one opaque code column; see §2. |
| `school_list_sessions` | `sales.list_selections` | Closest scaffold on main, but semantics differ (anonymous session token vs owner-digest-keyed durable selection); see §3. |
| — (none) | `sales.list_offers` | New concept/table. |
| `ISchoolDirectoryService` (school profile/browse) | *(kept, out of scope of #50's supply-list stories)* | develop doesn't appear to model a school "directory" browsing surface under `school-supply-lists`; likely stays a main-only concern. |
| Draft / Published / Archived (`status`) | same terms, `school_supply_lists.status` | New vocabulary entirely; no equivalent state on main today. |
| List Replacement (`replacesListId`/`replacedById`) | same | New vocabulary; no equivalent on main. |
| Exact Item / Allowed Alternative | same (`exactItem` flag / `allowedAlternatives()`) | New vocabulary; main's alternatives table pre-dates and doesn't match this dichotomy. |

## 5. Bottom line

**Roughly one table (`school_lists` → `school_supply_lists`) and one loosely-related scaffold (`school_list_sessions`) survive a rename; the state machine, item-substitution model, unlisted-access model, and List Selection all need structural, not additive, work.** Concretely:

1. **Strongest evidence for "structural, not additive"**: develop enforces the Draft → Published → List Replacement lifecycle with a **Postgres trigger** (`freeze_supply_list_item`/`freeze_supply_list` in `db/migrations/0007_list_selections.sql`) that makes published rows immutable at the database layer. main's `school_lists`/`school_list_items` have no `status` column, no replacement chain, and nothing preventing an admin update after "publish" — `isActive`/`publishedAt` are the only lifecycle-adjacent fields, and they don't compose into a state machine. Bolting draft/publish/replace semantics onto the existing mutable table is a rewrite of its row lifecycle, not a column addition.
2. **Second strongest evidence**: main's own `ParentListService` — the service that would own List Selection — is entirely unimplemented stubs, and its one sketched design (`addListToCart` merging into a `cart_kit`) is the opposite of what issue #50 story 4 asks for (a selection that *never* merges with the ordinary Cart). There is no working behavior to preserve here; adopting develop's `list_selections` design (owner-digest-keyed, `sales` schema, independent of `cart`) means discarding main's sketched merge-into-cart intent rather than extending it.
3. Two areas are safely additive/renamable: the list header row itself (rename `school_lists` → `school_supply_lists`, keep id/slug-like identity, add lifecycle columns) and possibly reusing `school_list_sessions`'s physical table as the new `list_selections` after a semantic rewrite of its keying.
4. One area is a *simplification*, not an addition: main's four-table access-grant/request/token/lockout apparatus should likely shrink to develop's single opaque `publicCode` column plus an unauthenticated `readUnlisted()`-style read path — carrying all of that machinery forward would contradict story 3's "possession, not discovery" model.

**Recommendation for the lifecycle design ticket (#150)**: treat this as a scoped rewrite of `backend/src/features/school/` and its schema (keep the feature-barrel architecture per #146's decision to not adopt develop's target architecture wholesale), reusing develop's *concepts* (status/replacement columns, `exactItem`/`specification`, `publicCode`, an owner-keyed selection table, a `list_offers` table) translated into main's existing Drizzle/feature-service conventions — not a lift-and-shift of develop's module code, and not an attempt to make main's current access/session tables fit by renaming alone.
