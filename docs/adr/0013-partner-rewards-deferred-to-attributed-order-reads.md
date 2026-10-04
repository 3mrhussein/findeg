---
status: accepted
---

# Partner Rewards deferred: phase one keeps only Order attribution and its reads

ADR-0006 (ledger), ADR-0009 (settlement) and the statement half of ADR-0010 (Partner Reports) built Partner Rewards into Order processing: a Reward Rate snapshotted at acceptance, entitlements written inside the acceptance transaction, automatic reversals, settlements, a signed Available Balance and Debt Forgiveness. How FindEg will actually reward schools, and how Staff and Partners will work together on it, is not known until the business runs. Decided in [#293](https://github.com/3mrhussein/findeg/issues/293).

Supersedes ADR-0006 and ADR-0009. Amends ADR-0005 and ADR-0010.

## Decisions

- **Rewards are a FindEg Staff calculation, done when needed, outside Order processing.** Nothing about rewards is computed, snapshotted or written during checkout, Order Acceptance or order/payment status transitions.
- **The only Partner–Order relationship is Order attribution** (ADR-0005): a list Order records its School Supply List, `publicCode`, published version and the Partner School's `businessPartnerId`, and each line records its list item and whether it was the Exact Item or a substitute. This stays exactly as built.
- **The db and backend layers expose reads, not workflows.** Query functions and a backend service return a Business Partner's attributed Orders and their totals for a date period, filterable by order and payment status, in Africa/Cairo time. There is no Staff UI, rate, balance or payout built on them yet.
- **Partner Reports keep the sales view only.** Monthly sales grouped by list item × variant, with the 3-Order suppression and no Customer data or Order References (ADR-0010), read from attributed Orders. The Reward Statement, Available Balance and settlement history are removed.
- **Removed:** the `rewards` schema tables (rates, entitlements, events, settlements, adjustments, Debt Forgiveness) and their views, the `partner-rewards` acceptance and transition hooks, the reward-rate reconfirmation in the Quote Confirmation, the Staff Reward Rate UI, and the related permissions other than report access.

## Considered options

- **Keep the merged ledger dormant.** Rejected: it encodes rates, earning rules and reversals the business hasn't chosen, and every Order would still pay for writing it.
- **Keep the ledger but drop settlement only.** Rejected for the same reason: the earning rules themselves are the unvalidated assumption.

## Consequences

- When reward requirements are clear, they start from the attributed-order reads as a new effort, with a fresh ADR. Until then, rewards calculation, rates, balances, payouts and the Partner–Staff rewards flow are out of scope, not open questions.
- Order Acceptance loses its rewards writes, so a rewards failure can no longer roll back an Order.
