# Backend Package

Shared backend library for FindEg monorepo. Provides business logic, data access, authentication, and utilities for both Dashboard and Storefront applications.

## Architecture

This package follows **Clean Architecture** with four layers:

```
src/
├── features/           # Feature modules
│   └── {feature}/
│       ├── domain/            # Business entities & rules
│       ├── application/       # Use cases & interfaces
│       │   ├── interfaces/   # Repository & service contracts
│       │   └── services/     # Business logic services
│       └── infrastructure/   # External concerns (DB, API, etc.)
│           └── persistence/  # Database implementations
├── lib/                # Shared utilities
│   ├── errors.ts      # Error classes
│   └── i18n.ts        # Internationalization utilities
└── types/              # Validation schemas & domain types
    ├── validation.ts  # Zod schemas
    └── domain.ts      # TypeScript types
```

### Pure TypeScript Library (Zero Framework Dependencies)

This backend package is a **pure TypeScript library** with **zero framework dependencies**. It contains ONLY business logic and can run in any Node.js environment without Next.js, React, or any UI framework.

**Key Principles:**
- ✅ **No framework imports**: Zero imports from `next/cache`, `next/navigation`, `next/headers`
- ✅ **No side effects**: Services return data or throw errors; they never call `redirect()`, `revalidatePath()`, or `cookies()`
- ✅ **Explicit parameters**: All required runtime data (session, cookies) passed as function parameters
- ✅ **Framework-agnostic testing**: All tests run in pure Node.js (Vitest) without Next.js runtime

**Backend Responsibilities:**
- Business logic and domain rules
- Data validation (Zod schemas)
- Database queries and mutations
- Domain errors and error catalog
- Service interfaces and contracts

**App-Layer Responsibilities (Dashboard/Storefront):**
- Framework integration (Next.js Server Actions, Server Components)
- Cache invalidation (`revalidatePath`, `revalidateTag`)
- Redirects and navigation (`redirect`, `notFound`)
- Session extraction from cookies
- Error translation to HTTP responses

### ServiceResult Pattern

Backend services return a `ServiceResult<T>` object that includes cache metadata for app-layer orchestration:

```typescript
import type { ServiceResult } from '@backend/features/core';

// Backend service (pure function)
export async function createProduct(input: ProductInput): Promise<ServiceResult<{ productId: number }>> {
  // Validate, create product in DB
  const product = await db.product.create(input);
  
  // Return data + cache metadata (NO cache invalidation here)
  return {
    success: true,
    data: { productId: product.id },
    cachePaths: ['/admin/products', `/admin/products/${product.id}`],
    cacheTags: ['products', 'shop']
  };
}
```

```typescript
// App-layer Server Action (handles framework integration)
'use server';
import { createProduct } from '@backend/features/catalog';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createProductAction(input: ProductInput) {
  try {
    const result = await createProduct(input);
    
    // App-layer handles cache invalidation
    result.cachePaths?.forEach(path => revalidatePath(path));
    result.cacheTags?.forEach(tag => revalidateTag(tag));
    
    return { success: true };
  } catch (error) {
    // Error translation happens here
    return { success: false, error: error.message };
  }
}
```

### Domain Errors

Backend services throw typed domain errors instead of calling framework routing:

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

# 188/188 tests passing
# Execution: 13.15 seconds
# Environment: Pure Node.js (no Next.js)
```

```typescript
// Example test (no framework setup required)
import { describe, it, expect } from 'vitest';
import { createProduct } from '../product';

describe('Product Actions', () => {
  it('returns ServiceResult with cache metadata', async () => {
    const input = { name: 'Test Product', price: 99.99 };
    const result = await createProduct(input);
    
    expect(result.success).toBe(true);
    expect(result.data.productId).toBeDefined();
    expect(result.cachePaths).toContain('/admin/products');
  });
});
```

## Installation

From monorepo root:

```bash
pnpm --filter @backend install
```

## Development

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
