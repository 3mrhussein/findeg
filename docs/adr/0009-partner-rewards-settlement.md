---
status: accepted
---

# Partner Rewards settlement

ADR-0006 built the Partner Rewards ledger (accrue, earn, reverse, adjust) and left settlement out, reserving a `settlement` event kind. `develop` (reference only) settled partner-wide through a per-order correction API. It required an `orderReference` that was only a label, a Finance-registered opaque "verified bank account" ID, proportional points/EGP allocation, and an `available = max(earned − settled, 0)` clamp. The research file lives on branch `research/partner-rewards-attribution`, not on main.

Depends on ADR-0003 (`business_partners`) and ADR-0006 (ledger, `rewards` schema, `partner-rewards` feature). Amends ADR-0006 by dropping the reserved `settlement` event kind.

## Decisions

**A settlement is a record, not a payment.** Finance pays a Partner School by bank transfer outside FindEg. A Staff member then records a Reward Settlement. FindEg never moves money, never integrates a disbursement provider, and has no in-kind or store-credit redemption.

**Available Balance is EGP only and signed.** Available = earned EGP − reversed EGP ± adjustment EGP + debt forgiveness EGP − settled EGP, in bigint piasters, computed on read. Pending never counts. Points stay on the Reward Statement for display but never limit a settlement, so develop's proportional allocation is not built.

**Debt nets out.** A reversal after a settlement can make available negative. The statement shows the signed value, and later earnings offset it automatically. There is no clawback, invoicing or refund blocking. Staff can forgive the debt with a reason-bearing debt forgiveness line (below), a distinct line type rather than an ADR-0006 `adjustment`.

**Partner-level settlement table.** Settlements are stored in `rewards.reward_settlements`, not in `reward_events`, which stay strictly per-entitlement. Each row holds: Business Partner, amount (bigint piasters, > 0 for a settlement), external transfer reference, paid-at date, Staff actor, notes, and an idempotency key. There is no Order Reference and no entitlement. Triggers forbid UPDATE/DELETE. The `settlement` event kind reserved by ADR-0006 is removed.

**Debt forgiveness.** Debt forgiveness is a third line type in `reward_settlements` (`settlement`, `void`, `debt-forgiveness`): partner-level, a positive amount, a required reason and an idempotency key. It takes the partner lock and requires `amount ≤ debt`, so it can only bring a negative balance up to zero, never past it. It is not voidable.

**Voids.** A mistaken settlement is corrected by a void row. It carries `voidsSettlementId`, the negated amount and a required reason. A unique index allows one void per original, and a void cannot itself be voided.

**No bank details in FindEg.** Payee bank details live only in Finance's banking system. FindEg stores no account numbers, no verified-account IDs, and has no verification flow. A settlement's transfer reference and notes are kept forever as financial records. The notes field warns Staff not to paste account numbers.

**Staff-initiated only.** Finance decides cadence and amounts. Partners have no payout request, and there is no minimum amount beyond 0.01 EGP.

**Permission.** Recording or voiding a settlement needs a new FindEg-Staff permission, `rewards.settle`, separate from `rewards.adjust`, surfaced in `frontend/dashboard`. One actor is enough, and there is no maker-checker. A settlement requires a caller-supplied idempotency key.

**Concurrency.** A settlement locks the `business_partners` row `FOR UPDATE`, recomputes available in the same transaction, requires `amount ≤ available`, then inserts. Voids and partner-level debt forgiveness take the same lock. Earning and reversals stay order-scoped (ADR-0006) and may push available negative concurrently, which the debt rule allows.

**Statement.** The computed Reward Statement gains `settled` and `available`. Staff see them in the dashboard. Which Partner Roles see them, and at what detail, is decided with Partner Reports.

## Considered options

- **Payout through a disbursement provider, or in-kind redemption as store credit**: each is a separate effort touching payments or Quote/checkout. Out of scope for COD-only phase one.
- **Settle points and EGP with proportional allocation (develop)**: needed only if points were spendable. Payouts are EGP and EGP values are fixed at acceptance.
- **Clamp available at 0 (develop)**: hides debt that still silently consumes future earnings. Rejected for an honest signed value.
- **Block reversals that would create debt**: punishes the Customer for a Partner-side balance. Rejected.
- **`settlement` event with a nullable entitlement or a label Order Reference (develop)**: breaks the per-entitlement invariant ADR-0006's unique indexes rely on. Rejected.
- **Opaque verified-bank-account IDs (develop)**: a table FindEg cannot check against anything. **Partner-managed encrypted accounts**: brings PII storage and a verification workflow. Both rejected for phase one.
- **Advisory lock on the partner (develop)**: replaced by a row lock on an existing row, with no magic lock-key constants.
- **Maker-checker approval**: deferred until payout volume justifies it.

## Consequences

- If Partners later need to manage payout accounts, request payouts, or need maker-checker approval, each is additive: a new table or state before the settlement insert.
- A negative Available Balance is a real state that Staff UI and any future Partner view must render clearly.
