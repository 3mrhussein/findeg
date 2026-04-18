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

## Monorepo Boundary Enforcement

To ensure Clean Architecture is preserved across our monorepo packages, we employ three levels of boundary enforcement:

### 1. Primary Enforcement: `package.json` Exports

The `@backend` package actively suppresses `infrastructure` leakage by explicitly defining subpath exports. Apps can only access what is explicitly authorized.

- **Allowed**: `"./features/catalog": "./dist/features/catalog/index.js"`
- **Blocked**: Infrastructure paths and direct file routes are denied by Node.js module resolution.

### 2. Secondary Enforcement: TypeScript Path Resolution

Both `@dashboard` and `@storefront` explicitly configure their `tsconfig.json` `paths` compiler option. We no longer rely on dynamic `@features/*` aliases that bleed into the backend.
Instead, apps import directly via the package name to enforce context boundaries:

```typescript
// ✅ Allowed (resolves through package.json exports)
import { createStorefrontServices } from "@backend/features/catalog";

// ❌ Forbidden (TypeScript and Node will throw configuration errors)
import { DrizzleProductRepository } from "@backend/features/catalog/infrastructure/...";
```

### 3. Bundling Optimization: `serverExternalPackages`

To completely insulate the client bundle from Node.js dependencies inherent to our infrastructure (like `postgres`, `drizzle-orm`, `jsonwebtoken`, `bcryptjs`), we define them as `serverExternalPackages` in our Next.js configuration. This serves as a fail-safe ensuring server-side modules never accidentally hydrate to the client.
