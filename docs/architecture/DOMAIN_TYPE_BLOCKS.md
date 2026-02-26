# Domain Type Blocks

Last updated: 2026-02-18

This document defines reusable value-object/type building blocks used to keep the system strongly typed across domain, application, infrastructure, and database contracts.

## 1. Localization Blocks

- `Locale`: constrained locale code (`en`, `ar`, extensible by policy).
- `LocalizedString<L extends string>`: map of locale to translated value.
- Named aliases (examples):
  - `TranslatedProductName`
  - `TranslatedProductDescription`
  - `TranslatedCategoryName`
  - `TranslatedSlug`

Rules:

- Localized business text must not be plain `string` in core entities.
- Slugs are localized objects, not a single shared slug.

## 2. Money and Pricing Blocks

- `Money`: `{ amount: number; currency: CurrencyCode }`
- `PriceBook`: persisted pricing channels/contexts by customer group and sale unit.
- `DiscountRule`: persisted discount definition (percent/fixed, schedule, eligibility).
- `ResolvedPricing`: computed runtime pricing output:
  - `basePrice`
  - `finalPrice`
  - `strikePrice` (computed, not persisted)
  - `appliedDiscounts`

Decision:

- `strikePrice` is derived from pricing + discount rules and is not persisted.
- Cost/wholesale prices remain persisted for profitability and B2B scenarios.

## 3. Media Blocks

- `MediaAsset`: canonical media reference.
- `ResponsiveMediaSet`: media variants by viewport/context (`thumbnail`, `card`, `pdp`, `zoom`).
- `LocalizedMediaAlt`: translated alt text per locale.

## 4. Identity and Access Blocks

- `UserId`, `GuestPrincipalId`, `OrganizationId`, `RoleId`, `PermissionId`.
- `PermissionCode`: atomic capability code (for example `catalog.write`).
- `RoleGrant`: role assignment with scope (`global`, `organization`).
- `ActorContext`: resolved actor identity + scopes used in guards.
- `SessionPayloadV2`: actor + scoped role IDs, no direct role-string enforcement.

## 5. Account and Credential Blocks

- `AuthAccount`: external/local linked account identity.
- `PasswordCredential`: hashed password and hash strategy metadata.
- `EmailAddress`, `PhoneNumber` value objects for normalized identity fields.
- `UserType`/`AccountType`: buyer/admin/business/guest policy-level categorization.

## 6. Organization and Membership Blocks

- `Organization`: business tenant/profile aggregate root.
- `OrganizationMembership`: user membership with scoped role grants.
- `MembershipStatus`: active/invited/suspended.

## 7. Payment Method Blocks

- `PaymentMethodToken`: provider token reference (never raw PAN/CVV).
- `PaymentMethodDescriptor`: masked display data and provider metadata.
- `BillingAddressSnapshot`: immutable address snapshot for checkout/order.

## 8. Mapping Policy

- Domain blocks are source-of-truth contracts.
- Infra/DB types should align directly where feasible to reduce mapper sprawl.
- Mapping is still allowed at external boundaries (API providers, legacy columns), but avoid redundant cross-layer mirror types.

## 9. Migration Policy

When a foundational block changes (for example `Money` or `LocalizedString` shape), update in this order:

1. Domain value object/type aliases.
2. Application interfaces and DTO schemas.
3. Infrastructure schema/repositories.
4. API/view-model contracts.
5. Tests, seeds, and documentation.
