---
status: accepted
---

# Business Partner Status affects only the Partner's own access

A Business Partner is `onboarding`, `active`, `suspended` or `closed` (ADR-0003; `closed` is final). ADR-0003, ADR-0004 and ADR-0006 never said what the status does outside the Partner Workspace. The code was inconsistent: the Partner School directory showed only `active` partners, while the public-code list read, checkout and Order Acceptance ignored status. Decided in [#293](https://github.com/3mrhussein/findeg/issues/293).

## Decisions

- **Customers and Orders never depend on the status.** The public-code list read, the Partner School directory, List Selection, checkout, Order Acceptance and its attribution snapshot, and fulfilment of accepted Orders behave the same in every status. A published list is a published list everywhere, including an onboarding partner's. The directory drops its `active` filter.
- **Only the Partner's own access depends on the status.** The existing Partner Workspace matrix stands:

  | Status       | Workspace read         | Membership changes | Reports | Publish / replace a list | Draft a list |
  | ------------ | ---------------------- | ------------------ | ------- | ------------------------ | ------------ |
  | `onboarding` | yes                    | yes                | yes     | yes                      | yes          |
  | `active`     | yes                    | yes                | yes     | yes                      | yes          |
  | `suspended`  | read-only, with notice | no                 | yes     | no                       | yes          |
  | `closed`     | no                     | no                 | yes     | no                       | no           |

  The list columns apply to whoever authors lists; who that is remains a separate decision. Closing a partner changes none of its lists: Staff archive them if they should stop selling.

- **No status gate in Order Acceptance.** Because nothing Customer-facing reads the status, acceptance takes no lock on `business_partners` and has no status rejection reason.

## Considered options

- **Only an `active` partner's lists can be read or bought** (one shared "partner is live" predicate). Rejected: a Partner's commercial state must not reach a Customer who is buying supplies for a child, and a suspension shouldn't break selections already in Customers' hands.
- **Readable but not purchasable while suspended.** Rejected for the same reason, and because it creates a dead-end page.
- **Archive a closed partner's lists automatically.** Rejected: a mass data change on a status flip; Staff archive deliberately instead.

## Consequences

- Partner Rewards are not status-driven either (ADR-0013 removes the ledger).
- ADR-0004's lifecycle gains a status check on publish, replace and draft; nothing else in lists or checkout changes.
