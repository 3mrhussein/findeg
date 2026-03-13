## Clean Architecture Conventions

These rules are enforced by code review and must be followed
in every new feature and every agent prompt.

### 1. Repositories Are Locale-Unaware

Repositories return raw domain objects with JSONB intact.
Locale resolution belongs in domain entities and presentation mappers.
See: `docs/architecture/clean-architecture.md#localization`

**Wrong:**

```ts
// ❌ Repository resolving locale
getById(id: number, locale: string) { ... }
```

**Correct:**

```ts
// ✅ Repository returns raw domain object
getById(id: number) { ... }
```

### 2. Variant Keys Are Built In One Place

`VariantKey.build()` in `catalog/domain/value-objects/VariantKey.ts`
is the single source of truth. Never reimplement the sorting rule inline.

### 3. Presentation Mappers Own Form Transformation

Domain object → form shape transformation lives in
`administration/presentation/mappers/`. Never in repositories or services.

### 4. No Price Columns On Products

Product display price is always resolved from the default variant
(`displayOrder = 1, isActive = true`). Never add price columns
to the products table.

### 5. Tags Are Internal Vocabulary

Tags have no localized labels in the DB. Customer-facing tag
display is handled by the static `tag-display.ts` config file.
See: `catalog/presentation/config/tag-display.ts`

### 6. No Translations Table

The project uses JSONB inline localization exclusively.
`catalog.translations` was removed — do not recreate it.
