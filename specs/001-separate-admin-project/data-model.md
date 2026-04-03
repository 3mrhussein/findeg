# Data Model: Package Structure & Dependencies

**Feature**: 001-separate-admin-project  
**Phase**: Phase 1 - Design  
**Date**: 2026-04-03

## Overview

This document defines the structural "data model" for the three-package monorepo, including package dependencies, export/import contracts, and the classification of existing features into their target packages.

---

## Package Dependency Model

```
┌──────────────────┐
│   dashboard      │
│  (Next.js app)   │────┐
└──────────────────┘    │
                        │
                        ▼
                  ┌──────────────────┐
                  │     backend      │
                  │ (TS library)     │
                  └──────────────────┘
                        ▲
                        │
┌──────────────────┐    │
│   storefront     │────┘
│  (Next.js app)   │
└──────────────────┘
```

**Dependency Rules**:
- ✅ Dashboard → Backend (imports)
- ✅ Storefront → Backend (imports)
- ❌ Dashboard ↔ Storefront (no direct imports allowed)
- ❌ Backend → Dashboard or Storefront (backend cannot import from frontend packages)

---

## Feature Module Classification

### Backend Package Features

**Rationale**: Core features providing shared functionality used by both frontend apps.

| Feature Module | Current Path | New Path | Exported Interfaces |
|---------------|--------------|----------|---------------------|
| **core** | `src/features/core/` | `packages/backend/src/features/core/` | `IAuthService`, `IPermissionService`, `ISessionService`, database schema, persistence contracts, i18n utilities |
| **identity** | `src/features/identity/` | `packages/backend/src/features/identity/` | `IUserRepository`, `IUserService`, user domain types, authentication flows |
| **media** | `src/features/media/` | `packages/backend/src/features/media/` | `IMediaService`, `IFileUploadService`, image processing utilities, storage contracts |

**Why Backend**:
- These features provide infrastructure and services used by both admin and customer-facing apps
- Database access layer centralized in backend (Drizzle ORM, migrations)
- Authentication and authorization logic shared across packages
- Single source of truth for core business rules

---

### Dashboard Package Features

**Rationale**: Admin-specific features for managing products, orders, customers, and system configuration.

| Feature Module | Current Path | New Path | Key Responsibilities |
|---------------|--------------|----------|---------------------|
| **administration** | `src/features/administration/` | `packages/dashboard/src/features/administration/` | Product management, category management, brand management, order management, customer management, analytics, bulk operations |

**Why Dashboard**:
- Exclusively used by admin users (requires elevated permissions)
- Admin-specific UI patterns (data tables, bulk editors, complex forms)
- No customer-facing functionality
- Can be deployed and scaled independently for internal team usage

---

### Storefront Package Features

**Rationale**: Customer-facing features for browsing products, managing cart, placing orders, and engaging with the platform.

| Feature Module | Current Path | New Path | Key Responsibilities |
|---------------|--------------|----------|---------------------|
| **cart** | `src/features/cart/` | `packages/storefront/src/features/cart/` | Shopping cart management, cart persistence, cart calculations, cart UI |
| **catalog** | `src/features/catalog/` | `packages/storefront/src/features/catalog/` | Product browsing, search, filtering, category navigation, product detail pages |
| **order** | `src/features/order/` | `packages/storefront/src/features/order/` | Checkout flow, order placement, order history, order tracking |
| **review** | `src/features/review/` | `packages/storefront/src/features/review/` | Product reviews, ratings, review moderation (customer-side) |
| **school** | `src/features/school/` | `packages/storefront/src/features/school/` | School-specific features, school lists, school supplies categorization |
| **notifications** | `src/features/notifications/` | `packages/storefront/src/features/notifications/` | Customer notifications, order updates, promotional messages |

**Why Storefront**:
- Customer-facing functionality requiring public access
- Higher traffic volume than admin features (requires separate scaling)
- Different performance optimization priorities (SEO, Core Web Vitals)
- Can be deployed independently for customer-facing updates

---

## Backend Package Exports

### Core Exports Structure

```typescript
// packages/backend/package.json
{
  "name": "@findeg/backend",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./features/core": "./dist/features/core/index.js",
    "./features/identity": "./dist/features/identity/index.js",
    "./features/media": "./dist/features/media/index.js",
    "./lib/*": "./dist/lib/*.js",
    "./types/*": "./dist/types/*.js"
  }
}
```

### Exported Interfaces & Types

**Authentication & Authorization**:
```typescript
// Backend exports
export interface IAuthService {
  generateJWT(userId: string, roles: string[]): Promise<string>;
  verifyJWT(token: string): Promise<JWTPayload>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  revokeToken(token: string): Promise<void>;
}

export interface IPermissionService {
  hasPermission(userId: string, permission: string): Promise<boolean>;
  hasRole(userId: string, role: string): Promise<boolean>;
  requireAuth(userId: string | null): asserts userId is string;
}

export type JWTPayload = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  exp: number;
  iat: number;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
```

**Database Access (Repository Pattern)**:
```typescript
// Backend exports
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findMany(filters: ProductFilters): Promise<Product[]>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: string, data: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
}

// Domain types
export type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  price: number;
  categoryId: string;
  brandId: string | null;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

**i18n Utilities**:
```typescript
// Backend exports
export function getMessages(locale: 'en' | 'ar'): Promise<Messages>;
export function formatCurrency(amount: number, locale: 'en' | 'ar'): string;
export function formatDate(date: Date, locale: 'en' | 'ar'): string;

export type SupportedLocale = 'en' | 'ar';
export type Messages = Record<string, string | Record<string, string>>;
```

**Validation Schemas (Zod)**:
```typescript
// Backend exports
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  roles: z.array(z.string()).optional(),
});

export const CreateProductSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().nullable(),
  stock: z.number().int().nonnegative(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
```

---

## Frontend Package Imports

### Dashboard Package Usage

```typescript
// packages/dashboard/src/app/[locale]/admin/products/actions.ts
'use server';

import { IProductRepository } from '@findeg/backend/features/core';
import { CreateProductSchema, type CreateProductInput } from '@findeg/backend/types/product';
import { requireAuth } from '@findeg/backend/features/identity';

export async function createProduct(data: CreateProductInput) {
  // Validate input
  const validated = CreateProductSchema.parse(data);
  
  // Check authentication
  const userId = await requireAuth();
  
  // Use backend repository
  const productRepo = getProductRepository(); // Exported from backend
  const product = await productRepo.create(validated);
  
  return product;
}
```

### Storefront Package Usage

```typescript
// packages/storefront/src/app/[locale]/(storefront)/products/[slug]/page.tsx
import { IProductRepository } from '@findeg/backend/features/core';
import { getMessages } from '@findeg/backend/lib/i18n';

type Props = {
  params: { locale: 'en' | 'ar'; slug: string };
};

export default async function ProductPage({ params }: Props) {
  // Fetch product from backend repository
  const productRepo = getProductRepository();
  const product = await productRepo.findBySlug(params.slug);
  
  if (!product) {
    notFound();
  }
  
  // Get translations
  const t = await getMessages(params.locale);
  
  return (
    <div>
      <h1>{params.locale === 'en' ? product.nameEn : product.nameAr}</h1>
      <p>{t.Products.Price}: {formatCurrency(product.price, params.locale)}</p>
    </div>
  );
}
```

---

## Database Schema Ownership

**Backend Package Owns**:
- All Drizzle schema definitions (`packages/backend/src/features/core/infrastructure/persistence/schema/`)
- Migration scripts (`packages/backend/migrations/` or root `scripts/migrations/`)
- Database connection management and pooling
- Query builders and ORM utilities

**Frontend Packages NEVER**:
- Import Drizzle directly (`import { db } from 'drizzle'` ❌)
- Write raw SQL queries
- Access database connection directly

**Enforcement**:
- ESLint rule: `no-restricted-imports` for `drizzle-orm` and `` in dashboard/storefront packages
- Backend repository interfaces are the only approved data access method
- Code review checklist verifies no direct database access in frontend packages

---

## Component & UI Duplication

**Initial State** (after migration):

```
packages/backend/         (components NOT stored here)
packages/dashboard/
└── src/components/
    ├── ui/              (shadcn/Radix primitives - duplicated)
    └── shared/          (cross-cutting components - duplicated)

packages/storefront/
└── src/components/
    ├── ui/              (shadcn/Radix primitives - duplicated)
    └── shared/          (cross-cutting components - duplicated)
```

**Rationale**:
- Both packages start with identical UI components from current `src/components/`
- Duplication allows independent UI evolution per package
- No shared UI package needed initially; can extract later if duplication becomes problematic

**Synchronization Strategy** (optional future):
- If components remain identical, extract to `packages/ui` shared package
- Use Turborepo internal packages for shared component library
- Version UI components independently if design systems diverge

---

## Package Configuration Files

### Backend Package (`packages/backend/package.json`)

```json
{
  "name": "@findeg/backend",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc --build",
    "dev": "tsc --watch",
    "test": "vitest",
    "db:migrate": "drizzle-kit migrate",
    "db:generate": "drizzle-kit generate:pg"
  },
  "dependencies": {
    "drizzle-orm": "^0.30.0",
    "postgres": "^3.4.0",
    "zod": "^3.22.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.2.0",
    "drizzle-kit": "^0.20.0"
  }
}
```

### Dashboard Package (`packages/dashboard/package.json`)

```json
{
  "name": "@findeg/dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:e2e": "cypress run"
  },
  "dependencies": {
    "@findeg/backend": "workspace:*",
    "next": "16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-intl": "^3.9.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "cypress": "^13.6.0",
    "@types/react": "^19.0.0"
  }
}
```

### Storefront Package (`packages/storefront/package.json`)

```json
{
  "name": "@findeg/storefront",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:e2e": "cypress run"
  },
  "dependencies": {
    "@findeg/backend": "workspace:*",
    "next": "16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-intl": "^3.9.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "cypress": "^13.6.0",
    "@types/react": "^19.0.0"
  }
}
```

---

## Summary

**Package Structure**:
- 3 packages: dashboard (admin UI), storefront (customer UI), backend (shared library)
- Clean dependency model: frontend → backend (no cross-frontend dependencies)
- Feature classification: administration → dashboard, cart/catalog/order/review/school/notifications → storefront, core/identity/media → backend

**Export/Import Contract**:
- Backend exports repository interfaces, services, types, validation schemas
- Frontend packages import from `@findeg/backend` via pnpm workspace protocol
- No direct database access in frontend packages

**Data Access**:
- Backend owns all database schema and migrations
- Frontend packages use repository pattern for all data operations
- Type safety enforced through TypeScript interfaces and Zod schemas

**Design Phase Complete** ✅  
Data model and dependency structure defined. Proceeding to contracts/ and quickstart.md generation.
