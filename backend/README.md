# @findeg/backend

The **FindEg Backend** is a pure TypeScript library serving as the monorepo's shared business kernel. It isolates the domain logic, database schemas (via Drizzle), and unified application services away from React server components. This enforces a strict separation of concerns, ensuring features are runtime-agnostic.

## 🏗️ Clean Architecture Execution

```mermaid
graph TD
    UI[Next.js App/Pages] -->|Calls API| APP[Application Layer]
    APP -->|Uses| DOMAIN[Domain Layer]
    APP -->|Orchestrates| INFRA[Infrastructure Layer]
    INFRA -->|Implements| REPO[Repositories]
    REPO -.->|Reads/Writes| DB[(PostgreSQL)]
```

### 1. Domain Layer (`src/features/*/domain`)

The nucleus of the business. Absolutely no external dependencies (no Drizzle, no Next.js).

- **Entities**: Pure business objects (e.g., `Product`, `Order`, `SchoolSupplyList`).
- **Value Objects**: Shared foundational types (`Money`, `LocalizedString`, `ActorContext`).
- **Zod Schemas**: Strict parsing boundaries validating inputs before crossing into the Service layer.
- **Domain Errors**: Extends `Error` into bounded, semantic failures (`InsufficientStockError`, `UnauthorizedError`).

### 2. Application Layer (`src/features/*/application`)

Orchestrators defining _use cases_.

- **Services**: Classes containing business logic (e.g., `CatalogService.ts`, `CheckoutService.ts`).
- **Interfaces**: Contracts that Infrastructure must fulfill (e.g., `IProductRepository`).

### 3. Infrastructure Layer (`src/features/*/infrastructure`)

The dirty boundaries talking to the outside world.

- **Persistence**: Drizzle ORM schemas mapped perfectly to database tables.
- **Repositories**: Implementing Application interfaces wrapping Drizzle logic.
- **Adapters**: Connecting to external systems (Resend for emails, AWS S3 for media).

---

## 🗄️ Database Management & Schema

The `@findeg/backend` owns the entire truth of the data.

**Database ER Diagram & Deep Schema Docs**:
👉 [Read the detailed SCHEMA.md & Global ER Diagram](../db/docs/SCHEMA.md)

Services throw `AppError` subclasses (`NotFoundError`, `ForbiddenError`, `UnauthorizedError`) from `@findeg/backend`. App-layer code translates them into framework behaviour.

```typescript
// Backend service throws an operational error
import { NotFoundError } from '@findeg/backend';

export async function requireUser<T>(userId: number, findUser: (id: number) => Promise<T | null>): Promise<T> {
  const user = await findUser(userId);
  if (!user) {
    throw new NotFoundError('User account not found');
  }
  return user;
}
```

```typescript
// App-layer catches and translates errors
'use server';
import { getMyAccountData, UnauthorizedError } from '@findeg/backend';
import { redirect } from 'next/navigation';

export async function getAccountPage(userId: number) {
  try {
    return await getMyAccountData(userId);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect('/login'); // Framework integration happens here
    }
    throw error;
  }
}
```

### Dependency Injection

Backend services depend on interfaces, not framework APIs. `ICookieStore` is the abstraction and `createCookieSessionProvider` is the factory:

```typescript
// App layer provides the Next.js implementation
import { cookies } from 'next/headers';
import { createCookieSessionProvider, type ICookieStore } from '@findeg/backend';

async function nextCookiesToStore(): Promise<ICookieStore> {
  const cookieStore = await cookies();
  return {
    get: (name) => cookieStore.get(name),
    set: (name, value, options) => cookieStore.set(name, value, options),
    delete: (name) => cookieStore.delete(name),
  };
}

// Inject the Next.js implementation
const sessionProvider = createCookieSessionProvider(await nextCookiesToStore());
const session = await sessionProvider.getSession();
```

### Testing in Pure Node.js

All backend tests run in Vitest without the Next.js runtime:

```bash
pnpm --filter @findeg/backend test
```

### Development Workflow

```bash
# Generate SQL migration file based on any schema changes
pnpm --filter @findeg/db db:generate

# Push changes directly for fast local iteration
pnpm --filter @findeg/db db:push

# Spin up local introspection UI
pnpm db:studio
```

---

## 📦 Feature Inventory

The backend is composed of 13 bounded context modules under `src/features`, plus the Orders package:

| Feature Module | Business Purpose | Key Domain Entities |
| --- | --- | --- |
| [**Catalog**](src/features/catalog/README.md) | Central PIM handling all discoverability. | `Product`, `Category`, `Variant`, `Brand` |
| [**Checkout**](src/features/checkout/index.ts) | Checkout validation and order acceptance. | `CheckoutService` |
| [**Orders**](../packages/orders/README.md) | Workspace Order reads and lifecycle; Checkout owns Acceptance. | `Order`, `OrderItem`, `Transaction` |
| [**Guest Access**](src/features/guest-access/README.md) | Lets a guest reach one Order without an account (ADR-0008). | `GuestAccessService` |
| [**Identity**](src/features/identity/README.md) | Hardened auth, RBAC permissions, token vending. | `User`, `Role`, `PasswordCredentials` |
| [**Partner Membership**](src/features/partner-membership/README.md) | Business Partners and who may work in their Partner Workspace. | `PartnerMembershipServices` |
| [**Partner Sales**](src/features/partner-sales/README.md) | Reads over Attributed Orders from Business Partners' School Supply Lists. | `SalesFigures` |
| [**Administration**](src/features/administration/README.md) | Operations auditing and back-office metrics. | `AuditLog`, `DashboardMetric` |
| [**School**](src/features/school/README.md) | B2B2C School Supply Lists (secure gateways). | `SchoolSupplyList`, `PartnerSchool` |
| [**Review**](src/features/review/README.md) | UGC (User Generated Content), scoring, and moderation. | `Review`, `HelpfulVote` |
| [**Media**](src/features/media/README.md) | Media delivery, S3 uploads, image compression. | `MediaAsset`, `FileLink` |
| [**Outbox**](src/features/outbox/README.md) | Transactional outbox: messages written in-transaction, delivered at least once. | `OutboxService`, `OutgoingEmail` |
| [**Core**](src/features/core/README.md) | System-wide building blocks. | `ServiceResult` |
| [**Notifications**](src/features/notifications/README.md) | Broadcasts, transactional emails, Bell-alerts. | `Notification`, `EmailTemplate` |

---

## 💎 Pure TypeScript Rules & `ServiceResult`

To maintain extreme purity in `@findeg/backend`:

- **NO FRAMEWORK LEAKS**: Do NOT import Next.js specific functions (`cookies()`, `headers()`, `redirect()`).
- **TYPED ERRORS**: Services throw `AppError` subclasses (`NotFoundError`, `ForbiddenError`, `UnauthorizedError`) for failures, and the app layer translates them. Successful results may carry cache metadata through the `ServiceResult` type.

### Example Integration Contract

```typescript
// Good
export async function getProduct(slug: string): Promise<ServiceResult<Product>> {
  const product = await ...; // load by slug
  if (!product) throw new NotFoundError(`Product ${slug} not found`);
  return { success: true, data: product, cacheTags: ['catalog'] };
}
```

---

## 🧪 Testing Pipeline

The backend guarantees soundness via **Vitest**. E2E is avoided entirely in this layer; tests are logic/unit, plus `*.integration.test.ts` files that run against a real Postgres 16 for locking, constraint, and race behaviour:

```bash
pnpm db:run && pnpm test:integration   # from the repo root; fresh migrated DB per run
```

Helpers live in `src/testing/postgres`. See [Running integration tests](../README.md#running-integration-tests) for details.

```bash
# Install workspace dependencies (from the repo root)
pnpm install

# Run all unit logic tests locally
pnpm --filter @findeg/backend test

# Enforce no-emit TypeScript structural checks (crucial for CI)
pnpm --filter @findeg/backend type-check
```

---


## Environment Variables

The env schema lives in `configs/env/src/backend.ts` (`@findeg/env/backend`). Copy `backend/.env.example` into the repo-root `.env` and configure:

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/findeg

# Auth (at least 32 characters each)
JWT_SECRET=your-super-secret-jwt-access-token-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-token-key-min-32-chars

# Optional
RESEND_API_KEY=re_your_resend_api_key
```

Generate secure secrets:

```bash
openssl rand -base64 32
```

## Usage

```typescript
// Root barrel: services, JWTService, errors, lib helpers
import { JWTService, getMyAccountData, formatCurrency } from '@findeg/backend';
```

## Public API

### Authentication

```typescript
import { JWTService } from '@findeg/backend';

const jwtService = new JWTService(accessSecret, refreshSecret);
const tokens = jwtService.generateTokens('42', email, roles);
const payload = jwtService.verifyToken(tokens.accessToken, 'access');
```

### Validation

```typescript
// CreateUserSchema lives in backend/src/types (workspace-internal, see Package Exports)
const result = CreateUserSchema.safeParse(data);
if (!result.success) {
  return { errors: result.error.flatten().fieldErrors };
}
```

### Error Handling

```typescript
import { ForbiddenError, NotFoundError } from '@findeg/backend';

if (!user) {
  throw new NotFoundError('User not found');
}

if (!hasPermission) {
  throw new ForbiddenError('Insufficient permissions');
}
```

### i18n Utilities

```typescript
import { formatCurrency, formatDate, formatRelativeTime } from '@findeg/backend';

formatCurrency(99.99, 'en', 'EGP');
formatCurrency(99.99, 'ar', 'EGP');

formatDate(new Date(), 'en');
formatRelativeTime(pastDate, 'en'); // e.g. "2 days ago"
```

## Package Exports

`backend/package.json` maps subpaths to `src/` (there is no `dist/` build):

- `.` maps to `src/index.ts`, the root barrel that also re-exports the lib helpers.
- `./features/<name>` maps to `src/features/<name>/index.ts` for each feature barrel.
- `./features/core/logger`, `./features/core/schemas` and the `schemas` entries of checkout, catalog and guest-access are also exported.
- `./lib` and `./types` have no exports entry. Import lib helpers from the root barrel `@findeg/backend`. The validation schemas in `src/types` are reachable only from inside the backend workspace via tsconfig paths.

## Testing

```bash
# Run all tests
pnpm --filter @findeg/backend test

# Run with coverage
pnpm --filter @findeg/backend test --coverage
```

Test coverage goals:

- Services: >80%
- Repositories: >70%
- Validation: 100%

## Type Safety

All exports are fully typed with TypeScript. Import types:

```typescript
import type { User } from '@findeg/backend';
```

## Contributing

1. Follow Clean Architecture layer boundaries
2. Add unit tests for new services/repositories
3. Update Zod schemas when changing data models
4. Export public interfaces from feature index.ts
5. Run `pnpm run lint` before committing

## License

Private - FindEg E-commerce Platform

&copy; 2026 FindEg.com. All rights reserved.
