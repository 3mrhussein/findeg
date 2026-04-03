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

## Identity & Security

### Rule: Secrets Are Separated from Profiles

Authentication secrets (password hashes, tokens, MFA seeds) are **never** stored in the `identity.users` table. They live in specialized tables like `identity.password_credentials`.

- **User Entity**: No `password` or `passwordHash` field.
- **Repository**: Uses `findPasswordCredentials(userId)` for authentication flows.

### Rule: Portal Roles are Routing Gates

The `users.portalRole` column is a strict application-level gate (`customer`, `staff`, `school_staff`).

- **Authentication**: `portalRole` is burned into the JWT.
- **Authorization**: Top-level route guards (e.g., `/admin/**`) check `portalRole`.
- **Granular Access**: Feature-level permissions (e.g., "CAN_EDIT_PRODUCT") are resolved from the RBAC tables (`user_roles` -> `permissions`).

### Rule: No Computed Full Names in DB

The `users.name` column is deleted and forbidden. Full names are resolved at the domain level:

- Use `user.firstName` and `user.lastName`.
- Resolve via `user.getUserFullName()` in domain logic.
