# Quickstart Guide: Separated Admin Dashboard Project

**Feature**: 001-separate-admin-project  
**Audience**: Developers working with the new three-package monorepo structure  
**Last Updated**: 2026-04-03

---

## Overview

The FindEg e-commerce codebase has been split into a Turborepo monorepo with three packages:

1. **`packages/backend`** - TypeScript library containing all business logic, database access, and shared utilities
2. **`packages/dashboard`** - Next.js app for admin users (product/order/customer management)
3. **`packages/storefront`** - Next.js app for customers (shopping, cart, checkout)

---

## Prerequisites

- **Node.js**: 18.17.0 or later
- **pnpm**: 8.0.0 or later (required for workspace management)
- **PostgreSQL**: 14.0 or later (database)
- **Git**: Latest version

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/3mrhussein/findeg.git
cd findeg.stationary
```

### 2. Install pnpm (if not installed)

```bash
npm install -g pnpm@latest
```

### 3. Install Dependencies

```bash
# Install all dependencies for all packages
pnpm install
```

This installs dependencies for:
- Root workspace
- packages/backend
- packages/dashboard
- packages/storefront

### 4. Configure Environment Variables

Create `.env` files for each package:

**Root `.env` (shared database)**:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/findeg_db"
JWT_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key"
```

**`packages/dashboard/.env.local`**:
```bash
NEXT_PUBLIC_APP_NAME="FindEg Admin Dashboard"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**`packages/storefront/.env.local`**:
```bash
NEXT_PUBLIC_APP_NAME="FindEg Storefront"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 5. Set Up Database

```bash
# Start PostgreSQL (Docker)
npm run db:start

# Run migrations from backend package
pnpm --filter @findeg/backend db:migrate

# (Optional) Seed database with sample data
npm run seed-db
```

---

## Development Workflow

### Run All Packages in Development Mode

```bash
# Run dashboard, storefront, and backend (watch mode) in parallel
pnpm run dev
```

This starts:
- **Dashboard**: http://localhost:3001
- **Storefront**: http://localhost:3000
- **Backend**: TypeScript watch mode (rebuilds on changes)

### Run Individual Packages

```bash
# Run only dashboard
pnpm --filter dashboard dev

# Run only storefront
pnpm --filter storefront dev

# Run only backend (watch mode)
pnpm --filter backend dev
```

### Build Packages

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter dashboard build
pnpm --filter storefront build
pnpm --filter backend build
```

### Run Tests

```bash
# Run all tests (unit + E2E)
pnpm test

# Run tests for specific package
pnpm --filter dashboard test
pnpm --filter storefront test:e2e

# Run backend unit tests
pnpm --filter backend test
```

### Lint & Type Check

```bash
# Run lint for all packages
pnpm run lint

# Type check all packages
pnpm run type-check

# Lint specific package
pnpm --filter dashboard lint
```

---

## Package-Specific Workflows

### Working on Backend Package

The backend package is a TypeScript library with no deployment. Changes to backend affect both frontend apps.

**Common Tasks**:

```bash
# Watch mode (auto-rebuild on changes)
pnpm --filter backend dev

# Build once
pnpm --filter backend build

# Run unit tests
pnpm --filter backend test

# Generate database migration
pnpm --filter backend db:generate

# Run database migration
pnpm --filter backend db:migrate
```

**Adding a New Repository**:

1. Create interface in `packages/backend/src/features/core/infrastructure/persistence/contracts/`
2. Implement repository in `packages/backend/src/features/core/infrastructure/persistence/repositories/`
3. Export from `packages/backend/src/features/core/index.ts`
4. Frontend apps can now import: `import { INewRepository } from '@findeg/backend/features/core'`

**Adding a New Domain Type**:

1. Define type in `packages/backend/src/types/`
2. Create Zod validation schema
3. Export from `packages/backend/src/types/index.ts`

### Working on Dashboard Package

Admin-facing Next.js app. Uses backend package for all business logic.

**Common Tasks**:

```bash
# Development server (http://localhost:3001)
pnpm --filter dashboard dev

# Build production bundle
pnpm --filter dashboard build

# Run E2E tests
pnpm --filter dashboard test:e2e

# Open Cypress UI
pnpm --filter dashboard test:e2e:open
```

**Adding a New Admin Page**:

1. Create route in `packages/dashboard/src/app/[locale]/admin/[feature]/`
2. Import backend repositories: `import { getProductRepository } from '@findeg/backend'`
3. Use Server Actions for mutations
4. Add translations to `packages/backend/src/features/core/infrastructure/cms/messages/{locale}.json`

**Example Server Action**:

```typescript
// packages/dashboard/src/app/[locale]/admin/products/actions.ts
'use server';

import { getProductRepository, CreateProductSchema } from '@findeg/backend';
import { requirePermission } from '@findeg/backend/features/identity';
import { revalidatePath } from 'next/cache';

export async function createProduct(data: unknown) {
  await requirePermission('products:create');
  const validated = CreateProductSchema.parse(data);
  const repo = await getProductRepository();
  const product = await repo.create(validated);
  revalidatePath('/[locale]/admin/products');
  return product;
}
```

### Working on Storefront Package

Customer-facing Next.js app. Uses backend package for all business logic.

**Common Tasks**:

```bash
# Development server (http://localhost:3000)
pnpm --filter storefront dev

# Build production bundle
pnpm --filter storefront build

# Run E2E tests
pnpm --filter storefront test:e2e
```

**Adding a New Customer-Facing Page**:

1. Create route in `packages/storefront/src/app/[locale]/(storefront)/[feature]/`
2. Fetch data in Server Components using backend repositories
3. Use Server Actions for mutations (cart, checkout, reviews)
4. Add translations to backend package messages

**Example Server Component**:

```typescript
// packages/storefront/src/app/[locale]/(storefront)/products/page.tsx
import { getProductRepository } from '@findeg/backend';

export default async function ProductsPage() {
  const repo = await getProductRepository();
  const products = await repo.findMany({ isActive: true, limit: 20 });
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## Turborepo Commands

Turborepo provides intelligent caching and task orchestration.

### Run Tasks Across Packages

```bash
# Run 'build' task in all packages
turbo run build

# Run 'build' only in packages that changed since last commit
turbo run build --filter=[HEAD^1]

# Run 'test' in dashboard and its dependencies
turbo run test --filter=dashboard...

# Clear Turborepo cache
turbo run build --force
```

### Filtering Packages

```bash
# Run command in specific package
turbo run dev --filter=dashboard

# Run command in multiple packages
turbo run build --filter=dashboard --filter=storefront

# Run command in package and its dependencies
turbo run build --filter=dashboard...
```

### Parallel Execution

Turbo automatically parallelizes tasks based on dependency graph:

```bash
# Build all packages in parallel (respecting dependencies)
turbo run build
# → backend builds first
# → dashboard + storefront build in parallel after backend completes
```

---

## Common Scenarios

### Scenario 1: I want to add a new product feature

**Steps**:
1. Determine if it's admin-only (dashboard) or customer-facing (storefront)
2. If shared logic needed, add to backend package first
3. Implement UI in appropriate frontend package
4. Add translations to backend messages
5. Write E2E tests in frontend package

**Example**: Adding product ratings

1. Backend: Add `IRatingRepository` interface and implementation
2. Storefront: Add rating display and submission UI
3. Dashboard: Add rating moderation UI
4. Add translations for both EN/AR

### Scenario 2: I changed the backend package and frontend isn't updating

**Solution**:
```bash
# Rebuild backend package
pnpm --filter backend build

# Restart frontend dev server
pnpm --filter dashboard dev  # or storefront
```

Turborepo should detect changes automatically, but manual rebuild may be needed if watch mode fails.

### Scenario 3: I need to add a new shadcn component

**Dashboard**:
```bash
cd packages/dashboard
pnpx shadcn-ui@latest add button
```

**Storefront**:
```bash
cd packages/storefront
pnpx shadcn-ui@latest add button
```

Components are duplicated by design. If synchronization needed later, extract to shared package.

### Scenario 4: Database schema changed

**Steps**:
1. Update Drizzle schema in `packages/backend/src/features/core/infrastructure/persistence/schema/`
2. Generate migration:
   ```bash
   pnpm --filter backend db:generate
   ```
3. Review generated SQL in `packages/backend/migrations/`
4. Run migration:
   ```bash
   pnpm --filter backend db:migrate
   ```
5. Update TypeScript types if needed
6. Rebuild backend: `pnpm --filter backend build`

### Scenario 5: E2E tests failing after changes

**Debug Steps**:
1. Run tests in headed mode:
   ```bash
   pnpm --filter dashboard test:e2e:open
   ```
2. Check if backend built successfully: `pnpm --filter backend build`
3. Verify database seeded correctly: `npm run seed-db`
4. Check environment variables in `.env.local`
5. Clear Next.js cache: `rm -rf packages/dashboard/.next`

---

## Troubleshooting

### Issue: `Cannot find module '@findeg/backend'`

**Cause**: Backend package not built or pnpm workspace linking broken

**Solution**:
```bash
pnpm install          # Re-link workspaces
pnpm --filter backend build  # Build backend
```

### Issue: TypeScript errors in frontend about backend types

**Cause**: Backend package TypeScript not compiled

**Solution**:
```bash
pnpm --filter backend build
```

### Issue: Changes to backend not reflected in frontend

**Cause**: Turborepo cache or backend not rebuilt

**Solution**:
```bash
pnpm --filter backend build
turbo run dev --force  # Clear cache and restart
```

### Issue: Port already in use

**Cause**: Previous dev server still running

**Solution**:
```bash
# Kill process on port 3000 (storefront)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (dashboard)
lsof -ti:3001 | xargs kill -9
```

### Issue: Database connection failed

**Cause**: PostgreSQL not running or wrong credentials

**Solution**:
```bash
# Start PostgreSQL via Docker
npm run db:start

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

---

## IDE Setup (VS Code)

### Recommended Extensions

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Turborepo** (`turborepo.turbo-vsc`)

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Multi-Root Workspace

Create `.code-workspace` file for better IDE experience:

```json
{
  "folders": [
    { "path": "." },
    { "path": "packages/backend", "name": "Backend" },
    { "path": "packages/dashboard", "name": "Dashboard" },
    { "path": "packages/storefront", "name": "Storefront" }
  ],
  "settings": {
    "typescript.tsdk": "node_modules/typescript/lib"
  }
}
```

---

## Deployment

### Dashboard (Admin)

**Vercel**:
```bash
# From root directory
vercel --cwd packages/dashboard
```

**Manual**:
```bash
pnpm --filter dashboard build
pnpm --filter dashboard start
```

### Storefront (Customer)

**Vercel**:
```bash
# From root directory
vercel --cwd packages/storefront
```

**Manual**:
```bash
pnpm --filter storefront build
pnpm --filter storefront start
```

### Environment Variables (Production)

Set in Vercel dashboard or CI/CD:
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (strong random string)
- `JWT_REFRESH_SECRET` (different strong random string)
- `NEXT_PUBLIC_APP_NAME` (per-app)
- `NEXT_PUBLIC_API_URL` (per-app)

---

## Additional Resources

- **Architecture Docs**: `docs/architecture/ARCHITECTURE_PLAYBOOK.md`
- **Coding Standards**: `docs/guides/CODING_STANDARDS.md`
- **Database Schema**: `docs/database/SCHEMA.md`
- **Component Placement**: `docs/development/component-placement.md`
- **Turborepo Docs**: https://turbo.build/repo/docs
- **Next.js 16 Docs**: https://nextjs.org/docs

---

## Getting Help

- **Architecture Questions**: Review `docs/architecture/ARCHITECTURE_PLAYBOOK.md`
- **Build Issues**: Check Turborepo cache with `turbo run build --summarize`
- **Type Errors**: Rebuild backend package: `pnpm --filter backend build`
- **Database Issues**: Review `docs/database/SETUP.md`

---

**Quickstart Version**: 1.0.0  
**Last Updated**: 2026-04-03  
**Maintained By**: FindEg Development Team
