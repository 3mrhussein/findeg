# Copilot Instructions — FindEg Monorepo

## Context

Monorepo using:

- Turborepo
- Next.js v16 (App Router)
- pnpm workspaces

Packages:

- @ui → shared UI
- @backend → business logic (Clean Architecture)
- @dashboard → admin app
- @storefront → customer app

---

## Core Rules

- Respect package boundaries
- Keep changes minimal and consistent
- Do not introduce new patterns if existing ones exist
- Prefer reuse over new implementations

---

## Dependency Rules

- Apps can import: `@ui`, `@backend`
- Packages MUST NOT depend on apps
- No circular dependencies

---

## Backend (Clean Architecture)

Structure per feature:

- domain → pure logic, no framework
- application → use cases + interfaces
- infrastructure → implementations (DB, APIs)
- presentation → hooks, mappers, schemas (NO JSX)

Hard rules:

- domain imports nothing
- infrastructure imports domain + application
- UI MUST NOT access DB directly
- never import another feature’s infrastructure

---

## Component Placement (STRICT)

Allowed:

1. `packages/ui`
   - primitives + shared components
   - no business logic

2. `packages/{dashboard|storefront}/src/components`
   - app-specific components

3. `packages/{dashboard|storefront}/src/app/**/_components`
   - route-level components

Forbidden:

- JSX inside backend
- cross-app component leakage

---

## Next.js v16 Rules (STRICT)

### Rendering & Data Fetching

- Use Server Components by default
- Fetch data using async/await in server components
- Do not fetch on client if it can be done on server

---

### Cache Components (Next.js 16 - MANDATORY)

**Rule**: Backend exports pure TS services. Apps create data layer with "use cache".

**Backend** (Pure TypeScript, NO Next.js APIs):
```typescript
// @backend/features/catalog/application/services/ProductService.ts
export class ProductService {
  async getAll(locale: string): Promise<Product[]> {
    const db = DrizzleConnection.getInstance();
    return await db.query.products.findMany();
  }
}
```

**App Data Layer** ("use cache" wraps backend calls):
```typescript
// packages/dashboard/src/data/products/queries.ts
"use cache";
import { cacheLife, cacheTag } from 'next/cache';
import { createCatalogServices } from '@backend/features/catalog';

export async function getProducts(locale: string) {
  cacheLife('hours');
  cacheTag('products');
  
  const { products } = createCatalogServices();
  return await products.getAll(locale);
}
```

**App Server Action** (Cache invalidation at app layer):
```typescript
// packages/dashboard/src/data/products/actions.ts
"use server";
import { updateTag } from 'next/cache';
import { createCatalogServices } from '@backend/features/catalog';

export async function createProduct(input: CreateProductInput) {
  const { products } = createCatalogServices();
  const product = await products.create(input);
  
  updateTag('products'); // App layer owns cache invalidation
  return product;
}
```

**Rules**:

- NEVER put "use cache" in backend (backend is pure TS)
- ALWAYS create app `src/data/{feature}/` layer for "use cache" functions
- Backend exports service factories only
- Apps import services and wrap calls in "use cache"
- Cache invalidation happens at app layer via `updateTag()`
- Do not duplicate fetch logic across pages

---

### Server Actions

- Prefer Server Actions over API routes
- Keep actions close to usage
- Avoid unnecessary client-server calls

---

### Forbidden (Anti-patterns)

- pages router
- getServerSideProps
- getStaticProps
- API routes for simple mutations
- unnecessary useEffect for data fetching

---

### Client Components

- Use "use client" only when required
- Keep client components minimal
- Never move server logic to client

---

## DRY (STRICT)

- Never duplicate:
  - database queries
  - types
  - schemas
  - transformations

- Always check before writing new code:
  1. Does it exist in @backend?
  2. Can it be shared?
  3. Is it already implemented elsewhere?

If yes → reuse

---

## Clean Code

- Small, focused functions
- Clear naming (no abbreviations)
- Prefer early returns
- Avoid deep nesting
- Remove dead code

---

## Data & State

- Prefer server state over client state
- Keep client state minimal
- Avoid global state unless necessary

---

## i18n

- No hardcoded UI strings
- Always add translations (en + ar)
- Use scoped namespaces

---

## Commands

- dev: `npm run dev`
- build: `npm run build`
- lint: `npm run lint`
- type-check: `npm run type-check`

Package-specific:

- `pnpm --filter <package> <script>`

---

## Definition of Done

- type-check passes
- lint passes
- build succeeds
- no duplicated logic
- architecture rules respected
- translations updated

---

## When Unsure

- follow existing patterns
- prefer simpler solution
- do not invent new architecture

## Next.js 16 Cache Components (Spec 006)

**Critical Pattern**:
- Backend: Pure TypeScript services (createCatalogServices(), createOrderServices(), etc.)
- Apps: Data layer at `src/data/{feature}/{queries|actions}.ts` with "use cache"/"use server"
- Backend NEVER imports from 'next/cache' or contains "use cache" directives

**App Data Layer Structure**:
```
packages/dashboard/src/data/
├── products/
│   ├── queries.ts    # "use cache" functions
│   └── actions.ts    # "use server" functions with updateTag()
├── orders/
│   ├── queries.ts
│   └── actions.ts
└── dashboard/
    └── queries.ts
```

## Active Technologies
- TypeScript 5.x (strict mode) + Drizzle ORM, Zod, bcrypt, jsonwebtoken, sharp, nodemailer
- PostgreSQL via Drizzle ORM (in backend infrastructure layer only)
- Next.js 16.x App Router + Turbopack (2-5x faster builds)
- Next.js 16 Cache Components with PPR (Partial Prerendering)
- Backend boundaries enforced via package.json exports + serverExternalPackages + TypeScript paths

## Recent Changes
- 006-nextjs16-cache-components: App data layer with "use cache", backend stays pure TS
