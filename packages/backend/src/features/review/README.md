# Review Feature

The **Review Feature** enables customers to generate Trust signals via verified feedback and ratings. It encapsulates moderation workflows, shielding the public storefront from spam.

## 🎯 Core Responsibilities

- **UGC Persistence**: Capturing user-generated comments and ratings (1-5 scales).
- **Moderation Workflow**: Emitting events to the Dashboard so staff can approve/reject items.
- **Product Re-calculation**: Firing bounded Context hooks to the `catalog` when a new verified review alters the aggregated star rating.

---

## 🏗️ Domain Entities Map

| Entity      | System Role                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `Review.ts` | The core document linking a `User` to a `Variant`, holding strict validation states (Pending, Approved, Rejected). |

---

## 🔐 Boundaries & Mutation Logging

- **Dependency Control**: Review has a hard dependency on `identity` to ensure the author is verified, and relies on `catalog` purely by reference (VariantId lookup).
- **Anti-Pattern Guard**: A `Review` object MUST NEVER perform complex Drizzle joins natively linking `User.passwordHash` or `Variant.pricing`. It must fetch only standard scalar references to guarantee payload safety for Next.js boundary serialization.

---

&copy; 2026 FindEg.com
