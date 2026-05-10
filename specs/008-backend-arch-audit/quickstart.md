# Quickstart: Backend Architectural Refactoring (Phase 1)

## Overview
This refactor decouples `AdminDashboardService` from direct DB access using CQRS Queries.

## Key Components

### 1. DB Queries (`@findeg/db/queries/dashboard`)
Low-level Drizzle functions for complex data retrieval.
```typescript
import { getCatalogHealthRaw } from "@findeg/db";
const stats = await getCatalogHealthRaw();
```

### 2. Application Queries (`backend/src/features/administration/application/queries`)
Query classes that call DB functions and handle DTO mapping.
```typescript
const query = new GetCatalogHealthQuery(categoryRepo, brandRepo);
const health = await query.execute();
```

### 3. Service Layer
The `AdminDashboardService` now receives these queries via Dependency Injection.

## Verification
```bash
# Run full build to check type safety
pnpm build

# Run backend unit tests
pnpm --filter @findeg/backend test:unit
```

## Error Handling & Validation
- **Validation**: Raw query results are validated at the DB boundary using Zod schemas in `db/queries/dashboard.ts`.
- **Errors**: All query classes wrap execution in try/catch and throw `QueryError` (domain error) on failure.
- **Service Layer**: The `AdminDashboardService` remains clean, simply delegating to these validated queries.
