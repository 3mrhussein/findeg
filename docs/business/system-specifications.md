# Enterprise System Specifications

As of 2026-10-12 · Clarity: **Formal Engineering & Behavioral System Specifications**

This document establishes the formal functional and non-functional specifications for all subsystems of the FindEg platform. It serves as the definitive engineering contract governing API interfaces, business invariants, data schemas, validation rules, and transactional boundaries. A rule's status (decided, proposed or _unconfirmed_) comes from the business-area page that owns it; this page restates rules and never promotes one.

---

## 1. Catalog & Merchandising Subsystem

### 1.1. Functional Requirements & Invariants
- **CA-1 (Default Variant)**: Every `Product` MUST possess at least one `ProductVariant`. Exactly one variant MUST be designated as `isDefault = true`.
- **CA-2 (SKU Uniqueness)**: Every `ProductVariant.sku` MUST be unique across the catalog, never empty and never padded with spaces. No SKU format is imposed.
- **CA-3 (Variant Pricing & Currency)**: Pricing lives exclusively on the `ProductVariant`. All prices MUST be represented as positive integer piasters in Egyptian Pounds (`EGP`). Optional `strikeThroughPrice` must exceed `price` if present.
- **CA-4 (Active Selling Constraint)**: Only products and variants with `isActive = true` are displayed on public storefront listings. Inactive variants MUST NEVER be resolved as Allowed Alternatives on School Supply Lists.
- **CA-5 (Bilingual Mandatory)**: Every product MUST provide both English (`name_en`, `description_en`) and Arabic (`name_ar`, `description_ar`) localized text strings.
- **CA-6 (Review Moderation)** _(unconfirmed)_: Reviews submitted by customers are marked `approved` immediately and appear on the storefront without pre-moderation.
- **CA-8 (Order Snapshot Immutability)**: Deleting, renaming, or modifying a product or variant MUST NEVER alter historical `OrderLine` records. Past orders retain frozen names, SKUs, and piaster prices.

### 1.2. Service & API Contracts

#### `CatalogService.importSpreadsheet(buffer: Buffer, mimeType: string): Promise<ImportResult>`
- **Input DTO**: Multipart file containing `.xlsx` or `.csv` with columns: `sku`, `name_en`, `name_ar`, `category_slug`, `price_egp`, `strike_through_egp`, `weight_grams`, `attributes_json`.
- **Behavior**: Parses all rows in memory. Performs strict validation on every row before any database interaction.
- **Error Modes**:
  - `FILE_FORMAT_INVALID`: File cannot be parsed or missing mandatory headers.
  - `VALIDATION_FAILED`: Returns `{ rowNumber, field, error }[]`. Entire file rejected (atomic).
- **Output DTO**: `{ success: boolean, totalProcessed: number, created: number, updated: number }`.

---

## 2. Quoting & Pricing Engine Subsystem

### 2.1. Functional Requirements & Invariants
- **CO-2 (Server Authority)**: Client devices MUST NEVER supply monetary totals or discounts. The server calculates all figures authoritatively from live database state.
- **CO-7 (Flat Shipping)**: Shipping is charged at a single flat fee of 50 EGP (`5000` piasters) across all Egyptian governorates.
- **CO-8 (List Offer Discount)**: The active `ListOffer` on a School Supply List is the exclusive permitted promotional discount. The discount percentage applies to every line item fulfilled from that list (including substitutes). Each line discount is rounded half-up to exact integer piasters:
  $$\text{lineDiscount} = \text{round}\left(\text{unitPrice} \times \text{quantity} \times \frac{\text{discountPercent}}{100}\right)$$
- **CO-9 (Exact Piasters)**: Currency is strictly EGP. Floating point arithmetic is forbidden for financial balances; calculations utilize BigInt or integer piasters.
- **CO-3 (Confirmation Fingerprint)**: Every quote produces a cryptographic digest `confirmationDigest = SHA256(JSON.stringify(normalizedTerms))`. Order acceptance requires proof that a freshly re-computed quote matches the digest confirmed by the customer.

### 2.2. Service & API Contracts

#### `QuotingEngine.calculateQuote(items: QuoteItemInput[], supplyListId?: string): Promise<QuoteDTO>`
- **Input DTO**:
  ```typescript
  interface QuoteItemInput {
    variantId: string;
    quantity: number; // positive integer >= 1
  }
  ```
- **Output DTO**:
  ```typescript
  interface QuoteDTO {
    items: {
      variantId: string;
      sku: string;
      unitPricePiasters: number;
      quantity: number;
      lineSubtotalPiasters: number;
      lineDiscountPiasters: number;
      lineTotalPiasters: number;
    }[];
    subtotalPiasters: number;
    totalDiscountPiasters: number;
    shippingFeePiasters: number; // 5000
    grandTotalPiasters: number;
    confirmationDigest: string; // SHA-256 hex string
    expiresAt: string; // ISO 8601 timestamp (15 minutes validity)
  }
  ```

---

## 3. Checkout & Order Acceptance Subsystem

### 3.1. Functional Requirements & Invariants
- **CO-1 (Cart vs. List Exclusivity)**: An order MUST originate from either the general shopping Cart OR exactly one School Supply List. Mixed orders are strictly prohibited.
- **CO-4 (Atomic Order Acceptance)**: Order acceptance is strictly all-or-nothing:
  1. Re-calculate live quote and verify `confirmationDigest`.
  2. Verify inventory across all requested variants.
  3. Freeze names, SKUs, and piaster prices into immutable `OrderLine` records.
  4. Create `StockReservation` holds for each line.
  5. Enqueue `order_confirmation` message into the Transactional Outbox.
  Partial acceptance and backorders are forbidden. Any failure aborts the entire transaction.
- **CO-5 (Idempotency)**: Retrying checkout with an identical `idempotencyKey` returns the original accepted order without creating duplicates. A retry that alters payload fields is rejected with `409 Conflict`.
- **CO-6 (Payment Method Exclusivity)**: Phase 1 exclusively accepts Cash on Delivery (`cod`). Card payment requests are rejected with `PAYMENT_METHOD_UNSUPPORTED`.
- **CO-14 (Public Order Reference)**: Every order receives an uppercase, readable public reference formatted as `FE-` followed by 6 Crockford Base32 characters (e.g. `FE-7K3N9X`). It is public and non-secret.

### 3.2. Service & API Contracts

#### `CheckoutService.processCheckout(cmd: CheckoutCommand): Promise<OrderResultDTO>`
- **Input DTO**:
  ```typescript
  interface CheckoutCommand {
    idempotencyKey: string; // UUID v4
    confirmationDigest: string;
    supplyListId?: string;
    lines: { variantId: string; quantity: number }[];
    customer: {
      email: string;
      name: string;
      phone: string; // Egyptian phone format (+20 or 01xxxxxxxxx)
    };
    deliveryAddress: {
      governorate: string; // Valid 27 Egyptian governorates
      city: string;
      streetAddress: string;
      buildingFloorApt?: string;
    };
    paymentMethod: 'cod';
  }
  ```
- **Error Modes**:
  - `IDEMPOTENCY_CONFLICT`: Payload differs from original idempotent execution.
  - `QUOTE_DIGEST_MISMATCH`: Live prices or active list offer changed. Customer must reconfirm.
  - `INSUFFICIENT_STOCK`: One or more items unavailable. Order rejected.
  - `INVALID_PHONE_NUMBER`: Phone does not match Egyptian telecommunication standards.

---

## 4. School Supply List Subsystem

### 4.1. Functional Requirements & Invariants
- **SL-1 (List Lifecycle)**: A School Supply List transitions strictly: `Draft` $\rightarrow$ `Published` $\rightarrow$ `Archived`. `Archived` is a terminal state.
- **SL-2 (Publication Freezing)**: Publishing a draft list freezes its items, specifications, prescribed quantities, and default variants permanently.
- **SL-3 (Slot Uniqueness)**: A slot defined by `(businessPartnerId, academicYear, grade)` holds AT MOST ONE `published` list at any time.
- **SL-4 (Slot Replacement Chain)**: Publishing a new list into an occupied slot atomically:
  1. Archives the currently published list in that slot.
  2. Sets `replacesListId = previousList.id` on the new list.
  3. Establishes the backward replacement audit chain.
- **SL-5 (Pre-Publish Verification)**: Publishing is refused if the list is empty, if any default variant is missing/inactive, or if a default variant fails to satisfy its item's specification. Out-of-stock items trigger advisory warnings but do not block publication.
- **SL-6 (Public Code)**: Publishing assigns a high-entropy, unguessable `publicCode` (32 hexadecimal characters). Holding this code is the only mechanism for families to reach the list.
- **SL-8 (Alternative Resolution Rule)**:
  - `ExactItem`: ONLY its pre-assigned default variant is permitted. Substitutions forbidden.
  - `Specification`: A product variant qualifies as an Allowed Alternative IF AND ONLY IF:
    1. Variant is active (`isActive = true`).
    2. Variant belongs to the exact Category specified.
    3. Variant possesses every attribute value defined in the item specification.
- **SL-10 (List Selection Device Isolation)**: A family's choices exist as a `ListSelection` stored exclusively on the customer's client device. It never merges with the Cart.
- **SL-12 (Advisory Completeness)**: `ListCompleteness` evaluates whether all required items are covered at prescribed quantities. It is strictly advisory and NEVER blocks checkout.

---

## 5. Business Partner Governance Subsystem

### 5.1. Functional Requirements & Invariants
- **PA-1 (Partner Lifecycle)**: A `BusinessPartner` transitions: `Onboarding` $\rightarrow$ `Active` $\leftrightarrow$ `Suspended` $\rightarrow$ `Closed`. `Closed` is terminal and irreversible.
- **PA-3 (Capability Matrix by Status)**:
  | Business Partner Status | Workspace Access | Membership Changes | Reports Viewable | Publish / Replace List | Draft List |
  |---|---|---|---|---|---|
  | **Onboarding** | Allowed | Allowed | Allowed | Allowed | Allowed |
  | **Active** | Allowed | Allowed | Allowed | Allowed | Allowed |
  | **Suspended** | Read-only | Blocked | Allowed | Blocked | Allowed |
  | **Closed** | Blocked | Blocked | Allowed | Blocked | Blocked |
- **PA-7 (Minimum Administrator Invariant)**: Every non-closed partner MUST maintain at least ONE active member with the `partner-administrator` role. Any action (role removal, suspension, removal) that would leave zero active administrators is rejected.
- **PA-8 (Membership Lifecycle)**: A `PartnerMembership` transitions: `active` $\leftrightarrow$ `suspended` $\rightarrow$ `ended`. `ended` is terminal.
- **PA-9 (Secret 7-Day Invitations)**: Invitations are tokenized, expire after 7 days, and require explicit acceptance by a user signed in with the invited email address.
- **PA-12 (Append-Only Access History)**: All modifications to partners, memberships, and invitations are synchronously written to the immutable `partner_access_history` table.

---

## 6. Partner Sales Attribution & Privacy Reporting Subsystem

### 6.1. Functional Requirements & Invariants
- **PA-14 (Privacy & k-Anonymity Invariants)**:
  1. The report aggregates sales on a monthly basis according to Cairo local time (`Africa/Cairo`).
  2. Cancelled and refunded orders are excluded.
  3. **k-Anonymity Threshold ($k=3$)**: If a specific item line aggregates purchases from fewer than 3 distinct orders, the line MUST NOT be rendered individually. Its units and revenue are folded into an aggregate `"Other items"` row.
  4. **Zero Re-Identification Guarantee**: The report MUST NEVER display customer names, phone numbers, addresses, order references (`FE-xxxxxx`), or discrete order counts.
- **PA-15 (Decoupled Rewards)**: Rewards are not stored or calculated during checkout. Financial reconciliation is an asynchronous FindEg staff calculation over attributed orders.

---

## 7. Operations & Fulfillment Subsystem

### 7.1. Functional Requirements & Invariants
- **CO-18 (Mandatory Phone Confirmation)**: An order in `pending` status becomes `confirmed` ONLY after FindEg Operations staff contact the customer by telephone and receive verbal confirmation of the COD purchase.
- **CO-12 (Strict Status Transitions)**:
  $$\text{pending} \rightarrow \{\text{confirmed}, \text{cancelled}\}$$
  $$\text{confirmed} \rightarrow \{\text{processing}, \text{cancelled}\}$$
  $$\text{processing} \rightarrow \{\text{shipped}, \text{cancelled}\}$$
  $$\text{shipped} \rightarrow \{\text{delivered}, \text{cancelled (parcel returned)}\}$$
  $$\text{delivered} \rightarrow \{\text{refunded}\}$$
  `cancelled` and `refunded` are terminal states.
- **CO-11 (Stock Lifecycle Synchronization)**:
  - At Order Acceptance: Stock is `RESERVED` in `stock_reservations`.
  - At Delivery: Reserved stock is `CONSUMED`, decremented from warehouse inventory, and the reservation row is removed.
  - At Cancellation: Reserved stock is `RELEASED`, returning units to available stock.
- **CO-13 (Refund Post-Delivery Invariant)**: A refund is permitted ONLY following successful delivery (`status = delivered`). Stopping an order prior to delivery is always a `Cancellation`.

---

## 8. Identity & Infrastructure Subsystem

### 8.1. Functional Requirements & Invariants
- **ID-1 & ID-2 (Realm Isolation)**:
  - Accounts are strictly `Customer` or `Staff`.
  - Staff roles (`Administrator`, `Catalog & Content Editor`, `Operations`) grant dashboard access only.
  - Partner roles (`partner-administrator`, `report-viewer`) grant Partner Workspace access only.
  - Staff roles NEVER grant partner workspace access, and partner roles NEVER grant dashboard access.
- **CO-15 (Guest Access Anti-Enumeration)**: Guest order lookup (`FE-xxxxxx` + email) returns identical HTTP responses whether or not an order exists. Verification codes are valid for 15 minutes, allow at most 5 attempts, and are limited to 3 code requests per order per hour.
- **Transactional Outbox Guarantees**: Domain mutations and outbound communication messages (`outbox_messages`) are committed in the SAME PostgreSQL transaction block. The background outbox poller guarantees at-least-once message delivery with exponential backoff retries.
