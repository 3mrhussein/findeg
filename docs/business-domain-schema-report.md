# Business Domain Schema: analysis and `@findeg/schema` report

Branch: `feat/business-domain-schema` (renamed from `claude/funny-hamilton-euzias` to satisfy AGENTS.md).

## What was built

- New workspace package `packages/schema` (`@findeg/schema`), registered in `pnpm-workspace.yaml`.
- It holds only business vocabulary: value sets (`as const`), inferred types, transition tables, and invariant constants. It depends on `zod` only, with no Drizzle, no workspace packages and no Node built-ins (enforced by its ESLint config).
- Modules: `common` (locale, money in piasters), `identity` (portal role, actor type, partner status, membership, roles, invitations), `sales` (order and payment status with transitions, payment method, order reference, attribution, List Offer), `school` (supply list status and transitions, public projection, governorates, school types, academic systems), `system` (outbox statuses).
- Tests pin the business values and check the invariants: transitions only target declared statuses, a refund follows only delivery, public list statuses exclude `draft`, and the order reference pattern matches the ADR example. 12 tests pass; type-check and lint are clean.
- Glossary term **Business Domain Schema** added to `GLOSSARY.md`; boundary decision recorded in `docs/adr/0017-business-domain-schema-package.md`.

Not in this change, by design: no consumer (db, packages, backend, frontends) imports the package yet, and the database enums and checks are unchanged. Switching them needs migrations and is the next step (see Open decisions).

## Method

Two read-only sub-agents analysed the layers in parallel: one covered db, backend and packages; the other covered the frontends and docs. I checked their key claims against the source and the ADRs myself.

## Verified findings

| # | Concept | Finding | Evidence |
|---|---|---|---|
| 1 | Payment method | Phase one is cash on delivery (GLOSSARY, ADR-0005). The database enum still has `card`, the storefront offers it, and the backend rejects it. | `db/src/types/enum-values.ts:14`, `backend/.../CheckoutService.ts:184`, `frontend/storefront/.../CheckoutClient.tsx:37` |
| 2 | Shipping estimate | The storefront shows 30 EGP for card and 50 for cash on delivery. The backend charges a flat 50 for all methods. | `CheckoutClient.tsx:151`, `CheckoutService.ts:59` |
| 3 | Ended membership | The backend rejects changes to ended memberships (`membership-ended`). The storefront shows ended as "Suspended" and offers Reactivate. | `MembershipService.ts:204,230`; `storefront/.../members/MembersList.tsx:73,100-102` |
| 4 | Currency | The dashboard's product table uses USD. Everything else, including the backend default, is EGP. | `frontend/dashboard/.../_components/ProductTable.tsx`; `db/src/types/common.ts:36` |
| 5 | Order status `confirmed` | Present in the database, the transition table and the UI. GLOSSARY says Order Acceptance is "not an order status" and forbids "confirmed order". | `enum-values.ts:6`, `order-status-transitions.ts:3-11`; GLOSSARY lines 97-99 |
| 6 | Order status in webmcp and email | The webmcp tool enum omits `confirmed` and `refunded`. The email template has a `returned` label that is not a status. | `backend/src/lib/webmcp/webmcp-tools.ts:197`; `OrderStatusUpdateEmail.tsx:36-46` |
| 7 | Money | Five representations (bigint piasters, decimal text, number, a float rounding helper, a string-typed `Price`). ADR-0007 intends exact piasters. | `packages/money/src/piasters.ts`; `catalog/.../Money.ts:35`; `core/domain/types/common.ts:27` |
| 8 | Partner School | The schema's foreign key points to the Business Partner, not to a Partner School profile, so the GLOSSARY rule is not enforced by the database. | `db/src/schema/school-engine/school-supply-lists.ts:44` |
| 9 | Replacement link | GLOSSARY's replacement chain uses `replacesListId`; publish checks `sourceListId`. | `SchoolSupplyListService.ts:211` |
| 10 | Dead legacy schema | `backend/src/types/validation.ts:103-110` has no importer and types `userId` as a UUID; `users.id` is an integer. | file as cited |
| 11 | Inactive product label | `isActive=false` is labelled "Draft" in some dashboard views and "Inactive" in another. GLOSSARY reserves Draft for lists. | `ProductCompact.tsx:108`, `ProductRow.tsx:136` |
| 12 | Hard-coded English | Some dashboard and checkout strings bypass i18n. | `PaymentForm.tsx`, `OrderTimeline.tsx` |

Claims from the sub-agents that I did **not** re-verify: the dashboard stub order helpers (`OrderDetailControls`, `orders-table`) being dead; the "Partner Program" footer link having no route; the `Verified School` copy; the 16-governorate list being partial (Egypt has 27 governorates, general knowledge, not in the repo); the guest-access attempt limit being unenforced; and the 7-day invitation expiry being unset in code.

## Canonical decisions encoded in `@findeg/schema`

| Concept | Canonical value | Reason |
|---|---|---|
| Payment method | `cod` only | GLOSSARY and ADR-0005. `card` documented as needing a decision record. |
| Order status | The seven current values, unchanged | Keeps behaviour identical; `confirmed` is flagged below. |
| Refund | Only from `delivered` | ADR-0005 amendment. |
| Membership status | `active`, `suspended`, `ended`; `ended` terminal | ADR-0003 and backend guard. |
| Partner status | `onboarding`, `active`, `suspended`, `closed`; `closed` final | GLOSSARY; ADR-0012 scope. |
| Partner roles | Four fixed roles | GLOSSARY, ADR-0003. |
| List status | `draft`, `published`, `archived`; public set excludes `draft` | GLOSSARY, ADR-0004. |
| Money | Integer piasters, `EGP` | ADR-0007. |
| Order reference | `FE-` plus six Crockford base32 characters | ADR-0005. |
| Rewards | Not modelled | ADR-0013 removed the rewards ledger. |

## Open decisions for you

1. **`confirmed` order status.** The GLOSSARY says Order Acceptance is not a status, but the workflow uses `confirmed` as an operational step between `pending` and `processing`. Keep it (current behaviour, encoded), or remove it, which needs a migration?
2. **`card` payment.** Dead code or planned? The database enum, the storefront and the shipping estimate all assume it. The schema encodes cash on delivery only.
3. **Governorates.** Is the 16-entry list intentionally partial? Egypt has 27.
4. **Currency in the dashboard product table.** Change USD to EGP?
5. **Shipping estimate.** Should the storefront show the backend's flat fee instead of 30 for card?
6. **Ended membership UI.** Remove Reactivate for ended memberships in both apps, per the backend guard?

## Next steps (not done here)

- Point db enums and checks at `@findeg/schema` (`inList`/`pgEnum` from the value arrays) once decisions 1 and 2 are settled, with a migration if values change.
- Replace the duplicated literals in `packages/orders`, `backend` and both frontends with imports, and add a guard against redeclared value sets.
