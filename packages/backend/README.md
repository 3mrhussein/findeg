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

## Installation

From monorepo root:

```bash
pnpm --filter @findeg/backend install
```

## Development

```bash
# Build TypeScript
pnpm --filter @findeg/backend build

# Watch mode
pnpm --filter @findeg/backend dev

# Run tests
pnpm --filter @findeg/backend test

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
import { JWTService, IUserRepository } from '@findeg/backend';
import { CreateUserSchema } from '@findeg/backend/types';

export async function createUser(formData: FormData) {
  'use server';
  
  const data = CreateUserSchema.parse(Object.fromEntries(formData));
  const userRepo = getUserRepository();
  const user = await userRepo.create(data);
  
  return { success: true, user };
}
```

### In Storefront App

```typescript
// Server Component
import { formatCurrency, formatDate } from '@findeg/backend/lib';
import { IProductRepository } from '@findeg/backend';

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
} from '@findeg/backend/features/core';
```

### Authentication

```typescript
import { JWTService, TokenPair, JWTPayload } from '@findeg/backend/features/identity';

const jwtService = new JWTService(accessSecret, refreshSecret);
const tokens = jwtService.generateTokens(userId, email, roles);
const payload = jwtService.verifyToken(tokens.accessToken, 'access');
```

### Validation

```typescript
import {
  CreateUserSchema,
  CreateProductSchema,
  CreateOrderSchema,
} from '@findeg/backend/types';

const result = CreateUserSchema.safeParse(data);
if (!result.success) {
  throw new ValidationError('Invalid input', result.error.flatten().fieldErrors);
}
```

### Error Handling

```typescript
import {
  AppError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '@findeg/backend/lib';

if (!user) {
  throw new NotFoundError('User not found');
}

if (!hasPermission) {
  throw new ForbiddenError('Insufficient permissions');
}
```

### i18n Utilities

```typescript
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '@findeg/backend/lib';

formatCurrency(99.99, 'en', 'EGP'); // "EGP 99.99"
formatCurrency(99.99, 'ar', 'EGP'); // "٩٩٫٩٩ ج.م"

formatDate(new Date(), 'en'); // "March 15, 2024"
formatRelativeTime(pastDate, 'en'); // "2 days ago"
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
pnpm --filter @findeg/backend test

# Run with coverage
pnpm --filter @findeg/backend test --coverage

# Watch mode
pnpm --filter @findeg/backend test --watch
```

Test coverage goals:
- Services: >80%
- Repositories: >70%
- Validation: 100%

## Type Safety

All exports are fully typed with TypeScript. Import types:

```typescript
import type { User, Product, Order } from '@findeg/backend';
import type { CreateUserInput, UpdateProductInput } from '@findeg/backend/types';
```

## Contributing

1. Follow Clean Architecture layer boundaries
2. Add unit tests for new services/repositories
3. Update Zod schemas when changing data models
4. Export public interfaces from feature index.ts
5. Run `pnpm run lint` before committing

## License

Private - FindEg E-commerce Platform
