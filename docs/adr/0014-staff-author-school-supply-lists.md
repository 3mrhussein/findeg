---
status: accepted
---

# FindEg Staff author School Supply Lists and Partner School Profiles

ADR-0003 defines a `list-manager` Partner Role, and ADR-0012 left open who authors lists. Nothing wrote `partner_school_profiles`, so no list could be created outside tests. Decided in [#296](https://github.com/3mrhussein/findeg/issues/296).

## Decisions

- **Staff author every School Supply List from the Staff dashboard:** draft, edit items, publish, replace or clone, archive, and the List Offer (ADR-0007). This uses the existing Staff-only lifecycle operations under `admin.schoollists.read` and `admin.schoollists.write`. Schools hand FindEg their list and Staff turn it into specifications. Writing a specification (a category plus attributes, or an Exact Item) takes catalog knowledge that a school doesn't have.
- **Staff own the Partner School Profile**, edited on the dashboard's Business Partner page. A Business Partner is a Partner School when it has a profile; there's no `kind` column. A profile is never removed and can be edited in every status. Governorate, school type and academic system are required. Area and logo are optional, and the logo is picked from the dashboard media library.
- **ADR-0012's status matrix applies to Staff authoring.** Staff can't publish or replace a list while the partner is `suspended` or `closed`, and can't draft one while it is `closed`. Archiving is allowed in every status.
- **`list-manager` is reserved.** No Partner Workspace surface reads or writes lists or profiles. The role stays in the CHECK constraint so that it can be invited and held without effect.

## Considered options

- **Partner self-authoring in the Partner Workspace (`list-manager`).** Rejected for phase one: schools lack the catalog knowledge to write specifications, and it would need a second authoring UI.
- **Both surfaces, or Staff authoring with a Partner review view.** Rejected: you would need rules for who can publish and for whose edits win, with no proven demand.
- **A `kind` column on `business_partners`.** Rejected: Partner Schools are the only kind, so the column would just repeat what the profile row says.

## Consequences

- If Partner self-authoring is ever wanted, it returns as a fresh effort. It would put a Partner actor beside the Staff actor on the same lifecycle operations.
