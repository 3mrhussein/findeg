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

- **Entities**: Pure business objects (e.g., `Product`, `Order`, `SchoolList`).
- **Value Objects**: Shared foundational types (`Money`, `LocalizedString`, `ActorContext`).
- **Zod Schemas**: Strict parsing boundaries validating inputs before crossing into the Service layer.
- **Domain Errors**: Extends `Error` into bounded, semantic failures (`InsufficientStockError`, `UnauthorizedError`).

### 2. Application Layer (`src/features/*/application`)

Orchestrators defining _use cases_.

- **Services**: Classes containing business logic (e.g., `CatalogService.ts`, `CheckoutService.ts`).
- **Interfaces**: Contracts that Infrastructure must fulfill (e.g., `IProductRepository`).

### 3. Infrastructure Layer (`src/features/*/infrastructure`)

<<<<<<< HEAD
```typescript
import type { ServiceResult } from '@backend/features/core';
=======
The dirty boundaries talking to the outside world.
>>>>>>> 006-docs-restructure

- **Persistence**: Drizzle ORM schemas mapped perfectly to database tables.
- **Repositories**: Implementing Application interfaces wrapping Drizzle logic.
- **Adapters**: Connecting to external systems (Resend for emails, AWS S3 for media).

<<<<<<< HEAD
```typescript
// App-layer Server Action (handles framework integration)
'use server';
import { createProduct } from '@backend/features/catalog';
import { revalidatePath, revalidateTag } from 'next/cache';
=======
---
>>>>>>> 006-docs-restructure

## 🗄️ Database Management & Schema

The `@findeg/backend` owns the entire truth of the data.

**Database ER Diagram & Deep Schema Docs**:  
👉 [Read the detailed SCHEMA.md & Global ER Diagram](docs/database/SCHEMA.md)

<<<<<<< HEAD
```typescript
import { 
  NotAuthenticatedError, 
  NotAuthorizedError, 
  ResourceNotFoundError,
  ValidationError,
  ConflictError,
  BusinessRuleViolationError
} from '@backend/features/core';

// Backend service throws domain error
export async function getMyAccountData(userId: number | null) {
  if (!userId) {
    throw new NotAuthenticatedError('Session required');
  }
  
  const user = await db.user.getById(userId);
  if (!user) {
    throw new ResourceNotFoundError('User account not found');
  }
  
  return user;
}
```

```typescript
// App-layer catches and translates errors
'use server';
import { getMyAccountData } from '@backend/features/identity';
import { redirect } from 'next/navigation';

export async function getAccountPage(userId: number) {
  try {
    return await getMyAccountData(userId);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      redirect('/login'); // Framework integration happens here
    }
    throw error;
  }
}
```

### Dependency Injection

Backend services depend on interfaces, not framework APIs:

```typescript
// Backend interface (abstraction)
export interface ICookieStore {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: any): void;
  delete(name: string): void;
}

// Backend service uses interface
export class CookieSessionProvider {
  constructor(private cookieStore: ICookieStore) {}
  
  async getSession(): Promise<SessionPayload | null> {
    const cookie = this.cookieStore.get('session');
    // ...
  }
}
```

```typescript
// App-layer provides Next.js implementation
import { cookies } from 'next/headers';
import { CookieSessionProvider, ICookieStore } from '@backend/features/core';

async function nextCookiesToStore(): Promise<ICookieStore> {
  const cookieStore = await cookies();
  return {
    get: (name) => cookieStore.get(name),
    set: (name, value, options) => cookieStore.set(name, value, options),
    delete: (name) => cookieStore.delete(name)
  };
}

// Inject Next.js implementation
const store = await nextCookiesToStore();
const provider = new CookieSessionProvider(store);
```

### Testing in Pure Node.js

All backend tests run in Vitest without Next.js runtime:

```bash
# Backend tests (pure Node.js, ~13 seconds)
pnpm --filter @backend test
=======
### Development Workflow

```bash
# Generate SQL migration file based on any schema changes
pnpm db:generate
>>>>>>> 006-docs-restructure

# Push changes directly for fast local iteration
pnpm db:push

# Spin up local introspection UI
pnpm db:studio
```

---

## 📦 Feature Inventory

The backend is composed of 10 rigidly bounded context modules:

| Feature Module                                              | Business Purpose                                       | Key Domain Entities                           |
| ----------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| [**Catalog**](src/features/catalog/README.md)               | Central PIM handling all discoverability.              | `Product`, `Category`, `Variant`, `Brand`     |
| [**Cart**](src/features/cart/README.md)                     | Ephemeral shopping session state.                      | `CartHeader`, `CartItem`                      |
| [**Order**](src/features/order/README.md)                   | Checkout, fulfillment, and post-purchase ledger.       | `Order`, `OrderItem`, `Transaction`           |
| [**Identity**](src/features/identity/README.md)             | Hardened auth, RBAC permissions, token vending.        | `User`, `Role`, `PasswordCredentials`         |
| [**Administration**](src/features/administration/README.md) | Operations auditing and back-office metrics.           | `AuditLog`, `DashboardMetric`                 |
| [**School**](src/features/school/README.md)                 | B2B2C School Supply Lists (secure gateways).           | `SchoolList`, `SchoolListItem`, `AccessToken` |
| [**Review**](src/features/review/README.md)                 | UGC (User Generated Content), scoring, and moderation. | `Review`, `HelpfulVote`                       |
| [**Media**](src/features/media/README.md)                   | Media delivery, S3 uploads, image compression.         | `MediaAsset`, `FileLink`                      |
| [**Core**](src/features/core/README.md)                     | System-wide building blocks.                           | `ServiceResult`, `Pagination`                 |
| [**Notifications**](src/features/notifications/README.md)   | Broadcasts, transactional emails, Bell-alerts.         | `Notification`, `EmailTemplate`               |

---

## 💎 Pure TypeScript Rules & `ServiceResult`

To maintain extreme purity in `@findeg/backend`:

- **NO FRAMEWORK LEAKS**: Do NOT import Next.js specific functions (`cookies()`, `headers()`, `redirect()`).
- **NO THROWING EXCEPTIONS**: Services employ the **Railway Oriented Programming** pattern via the custom `ServiceResult` utility.

### Example Integration Contract

```typescript
// Good
export async function getProduct(slug: string): Promise<ServiceResult<Product, CatalogError>> {
  if (!product) return Err(new ProductNotFoundError(slug));
  return Ok(product);
}
```

---

## 🧪 Testing Pipeline

The backend guarantees soundness via **Vitest**. E2E is avoided entirely in this layer; it is purely logic/unit.

```bash
<<<<<<< HEAD
pnpm --filter @backend install
=======
# Run all unit logic tests locally
pnpm test

# Run tests watching for TDD integration
pnpm test:watch

# Enforce no-emit TypeScript structural checks (crucial for CI)
pnpm type-check
>>>>>>> 006-docs-restructure
```

---

<<<<<<< HEAD
```bash
# Build TypeScript
pnpm --filter @backend build

# Watch mode
pnpm --filter @backend dev

# Run tests
pnpm --filter @backend test

# Type check
tsc --noEmit -p packages/backend
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required
JWT_SECRET=your-super-secret-jwt-access-token-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-token-key-min-32-chars
DATABASE_URL=postgresql://user:password@localhost:5432/findeg

# Optional
RESEND_API_KEY=re_your_resend_api_key
```

Generate secure secrets:

```bash
openssl rand -base64 32
```

## Usage

### In Dashboard App

```typescript
// Server Actions
import { JWTService, IUserRepository } from "@backend";
import { CreateUserSchema } from "@backend/types";

export async function createUser(formData: FormData) {
  "use server";

  const data = CreateUserSchema.parse(Object.fromEntries(formData));
  const userRepo = getUserRepository();
  const user = await userRepo.create(data);

  return { success: true, user };
}
```

### In Storefront App

```typescript
// Server Component
import { formatCurrency, formatDate } from '@backend/lib';
import { IProductRepository } from '@backend';

export default async function ProductPage({ params }: Props) {
  const productRepo = getProductRepository();
  const product = await productRepo.findBySlug(params.slug);

  return (
    <div>
      <h1>{product.nameEn}</h1>
      <p>{formatCurrency(product.price, 'en', 'EGP')}</p>
      <time>{formatDate(product.createdAt, 'en')}</time>
    </div>
  );
}
```

## Public API

### Repository Contracts

```typescript
import {
  IUserRepository,
  IProductRepository,
  ICategoryRepository,
  IOrderRepository,
} from "@backend/features/core";
```

### Authentication

```typescript
import { JWTService, TokenPair, JWTPayload } from "@backend/features/identity";

const jwtService = new JWTService(accessSecret, refreshSecret);
const tokens = jwtService.generateTokens(userId, email, roles);
const payload = jwtService.verifyToken(tokens.accessToken, "access");
```

### Validation

```typescript
import { CreateUserSchema, CreateProductSchema, CreateOrderSchema } from "@backend/types";

const result = CreateUserSchema.safeParse(data);
if (!result.success) {
  throw new ValidationError("Invalid input", result.error.flatten().fieldErrors);
}
```

### Error Handling

```typescript
import { AppError, UnauthorizedError, NotFoundError, ValidationError } from "@backend/lib";

if (!user) {
  throw new NotFoundError("User not found");
}

if (!hasPermission) {
  throw new ForbiddenError("Insufficient permissions");
}
```

### i18n Utilities

```typescript
import { formatCurrency, formatDate, formatRelativeTime } from "@backend/lib";

formatCurrency(99.99, "en", "EGP"); // "EGP 99.99"
formatCurrency(99.99, "ar", "EGP"); // "٩٩٫٩٩ ج.م"

formatDate(new Date(), "en"); // "March 15, 2024"
formatRelativeTime(pastDate, "en"); // "2 days ago"
```

## Package Exports

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./features/core": "./dist/features/core/index.js",
    "./features/identity": "./dist/features/identity/index.js",
    "./lib": "./dist/lib/index.js",
    "./types": "./dist/types/index.js"
  }
}
```

## Testing

```bash
# Run all tests
pnpm --filter @backend test

# Run with coverage
pnpm --filter @backend test --coverage

# Watch mode
pnpm --filter @backend test --watch
```

Test coverage goals:

- Services: >80%
- Repositories: >70%
- Validation: 100%

## Type Safety

All exports are fully typed with TypeScript. Import types:

```typescript
import type { User, Product, Order } from "@backend";
import type { CreateUserInput, UpdateProductInput } from "@backend/types";
```

## Contributing

1. Follow Clean Architecture layer boundaries
2. Add unit tests for new services/repositories
3. Update Zod schemas when changing data models
4. Export public interfaces from feature index.ts
5. Run `pnpm run lint` before committing

## License

Private - FindEg E-commerce Platform
=======
&copy; 2026 FindEg.com. All rights reserved.
>>>>>>> 006-docs-restructure
