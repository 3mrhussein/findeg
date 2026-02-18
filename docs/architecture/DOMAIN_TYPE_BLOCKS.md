# Domain Type Blocks

This document defines the smallest reusable type/value-object blocks for DDD-driven typing.

## Core Blocks

1. Locale
- Source: `src/features/core/domain/value-objects/Locale.ts`
- Types:
  - `Locale = "en" | "ar"`
  - `DEFAULT_LOCALE`
- Helpers:
  - `resolveLocale(input)`
  - `isLocale(input)`

2. Localized Text
- Source: `src/features/core/domain/value-objects/Translation.ts`
- Types:
  - `LocalizedText = Record<Locale, string>`
  - `LocalizedTextDraft = Partial<Record<Locale, string>>`
- Helper:
  - `resolveLocalizedText(map, locale, fallback)`

3. Money
- Source: `src/features/core/domain/value-objects/Money.ts`
- Types:
  - `CurrencyCode`
  - `MoneyAmount`
  - `Money = { amount: MoneyAmount; currency: CurrencyCode }`
- Helpers:
  - `toMoney(amount, currency)`

## Common Type Bridge

`src/features/core/domain/types/common.ts` remains the stable import point and now bridges to value-objects:
- `Price` is currently an alias to `MoneyAmount` for backward compatibility.
- `Locale`, `CurrencyCode`, and `Money` are re-exported from this module.

This keeps old call-sites working while enabling richer domain modeling.

## Where It Is Applied

1. Domain entities
- `Product` now supports:
  - `locale`
  - `localizedContent`
  - `currency`
  - `priceMoney` / `strikePriceMoney`
- `Category` now supports:
  - `locale`
  - `localizedContent`

2. Domain input schemas
- Product/category translation `language` is now constrained by `LocaleSchema`.

3. Persistence schema typing
- Translation `language` columns are typed as `Locale`.
- Order/payment/currency columns are typed as domain enums/value-objects.
- Variant pricing `customerGroup` / `uomCode` / `currency` are typed.

4. Repository/service contracts
- Catalog/admin language parameters are typed with `Locale`.
- Locale conversion at boundaries uses `resolveLocale(...)`.

## Migration Path: Numeric Price -> Money Object

Current model keeps `price: Price` (numeric) for compatibility.

When you are ready to fully migrate:
1. Change `Product.price` and related fields to `Money`.
2. Remove numeric-only assumptions in pricing and UI helpers.
3. Update repository mappers to return `Money` directly.
4. Replace formatting logic to use `money.currency` instead of implicit defaults.

Because price flows through shared `Price`/`Money` blocks, compiler errors will guide all impacted layers.
