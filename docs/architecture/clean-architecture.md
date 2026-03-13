## Localization In Clean Architecture

### Rule: Repositories Are Locale-Unaware

Repositories return raw domain objects with all JSONB localized
fields intact. They never accept a `locale` parameter for the
purpose of resolving display strings, and they never unpack
`{ en: "...", ar: "..." }` into a single string.

**Wrong — locale resolution in repository:**

```ts
// ❌ NEVER do this in a repository
async findById(id: number, locale: string): Promise<{ name: string }> {
  const product = await db.select().from(products).where(eq(products.id, id));
  return { name: product.localizedName[locale] }
}
```

**Correct — raw domain object from repository:**

```ts
// ✅ Repository returns raw domain object
async findById(id: number): Promise<Product | null> {
  const row = await db.select().from(products).where(eq(products.id, id));
  return toDomainProduct(row)  // JSONB fields intact
}
```

### Where Locale Resolution Belongs

| Layer                | Responsibility                         | Example                           |
| -------------------- | -------------------------------------- | --------------------------------- |
| Domain entity        | Business-rule resolution with fallback | `product.getName(locale)`         |
| Presentation mapper  | Domain → UI shape transformation       | `toProductFormValues(product)`    |
| Storefront component | Display resolved string                | `product.getName(locale)`         |
| Shared utility       | One-off edge cases only                | `resolveLocalized(field, locale)` |

### The Fallback Rule

The fallback rule is a business rule — it lives in the domain:

> Requested locale → English fallback → empty string
> Never return undefined to the UI

This rule is encoded once in domain entity methods and never
duplicated elsewhere.

### FindEg Localization Strategy

- Dynamic content → JSONB inline on entity tables
- Static UI text → next-intl message files (en.json / ar.json)
- No translations table — ever
