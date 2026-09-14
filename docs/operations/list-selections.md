# School Supply List shopping

Ticket #60 extends the unified Customer Storefront with a dedicated List Selection
for an unlisted School Supply List. The selection is scoped to its browser or
Customer owner and list identity. It never merges with the ordinary Cart or a
replacement list. Published replacements require a fresh selection; archived
links remain historically viewable and cannot be checked out.

Required items begin selected at their prescribed quantities. Optional items are
opt-in. A set count provides the completeness target; individual quantities remain
editable. Save choices commits all staged edits together, allowing several stale
choices to be repaired in one update; unsaved edits disable checkout. List Completeness is advisory, including when required items are omitted.
A non-empty eligible selection may be purchased regardless of completeness.

Allowed Alternatives are derived from active Catalog variants matching the frozen
category and every explicitly specified attribute. Exact Items allow only their
default variant. Lists published before specifications were recorded fail closed:
only the frozen default is eligible. Price, brand, and unspecified attributes are
shown for comparison; the Customer deliberately chooses a substitution.

Checkout uses the existing Cash-on-Delivery and Guest Order Access foundations.
It revalidates list eligibility, choices, current prices, offers, delivery, and stock
inside the acceptance transaction. Accepted line snapshots retain the list,
Partner School, source item, frozen specification, default and purchased variants,
and applied discount. Later source changes cannot rewrite accepted Orders.

Partner Points accounting and reward lifecycle belong to #61. This ticket supplies
immutable item attribution for that workflow and does not implement #61.

## Access and configuration

Open `/en/lists` or `/ar/lists` to enter a code, or share `/en/lists/<code>`
(`/ar/lists/<code>` for Arabic). A QR code encodes the same unlisted URL.
There is no directory of lists. Guest selections use a separate opaque
`findeg_list_selection` HttpOnly/Secure/SameSite=Lax cookie; the database stores
only an owner digest. A valid Customer Current Session scopes selections to the
User across devices. Signing in selects that User's independent selections; it
does not merge the guest's choices. Each checkout always produces one Order.

`LIST_SELECTION_INACTIVITY_DAYS` is parsed by the web runtime and defaults to 30.
Expired published selections restart at required defaults. Archived selections
reset to an empty view after expiry. The guest browser credential uses the same configured lifetime and refreshes on
each selection request. Uncertain checkout requests remain
in tab session storage under a list-specific key until a definitive response.

FindEg configures Commerce-owned `sales.list_offers` using restricted operational
SQL: one percentage in basis points (0–10000) and inclusive start/exclusive end
per stable list identity. The default is zero; a clone does not inherit an offer.
Set `starts_at` and optional `ends_at` explicitly for scheduled eligibility.
There are no quantity, completeness, Customer or repeat-purchase limits. The
current target has no other promotion engine, so no promotions are stacked.
This slice adds no Partner-controlled offer endpoint. Delivery fees stay unchanged.

List management uses `@findeg/backend/school-supply-lists` for both direct runtime
calls and the versioned Partner HTTP route. Mutations accept an opaque Current
Session token, never a caller-constructed session. The application coordinator
resolves Identity and locks the selected Business Partner before checking its
current Partner Membership and List role in the mutation transaction. This
serializes List writes with session revocation, User invalidation, Partner status
changes and membership administration. Missing, fabricated, expired and revoked
credentials require authentication. Authorization Denial preserves a valid
Current Session. Failed domain mutations roll back their List writes.

Partner list draft item input now accepts `required` (defaults to true) and
`specification: { categoryId, attributes }`. Publication validates a supplied
specification against the active default. DB triggers freeze published content;
corrections require a cloned Draft and replacement. Historical missing
specifications permit the default only and cannot enable substitutes.

## Validation

`tests/list-selections.test.mjs` exercises real PostgreSQL application operations
and HTTP contracts. `frontend/web/cypress/e2e/list-selections.cy.js` runs within
the isolated checkout test database for Arabic and English, including incomplete
checkout, deliberate substitution, reload, uncertain-response replay, immutable
attribution, archived views and Cart separation. Both run in `pnpm quality:check`.
