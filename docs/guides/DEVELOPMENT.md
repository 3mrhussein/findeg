# Development & Infrastructure Guide

This guide provides a comprehensive workflow for developing, managing, and deploying the FindEg platform.

## Architectural Layers

The codebase follows **Clean Architecture** with a move toward **feature-based** organization:

1.  **Domain**: Entities, Value Objects, and Domain Types (inside each feature's `domain/`).
2.  **Application**: Service Interfaces, Use Cases, Repository Interfaces (ports) — inside each feature's `application/`.
3.  **Infrastructure**: Database (Drizzle), API Clients, CMS Adapters — inside each feature's `infrastructure/` or in `core`.
4.  **Presentation**: Next.js Pages (Routes), Co-located Components, Feature UI — inside each feature's `ui/` or `components/`.

See [DDD & Clean Architecture Refactor Plan](../architecture/DDD_CLEAN_ARCHITECTURE_REFACTOR_PLAN.md) and [Feature Structure](../architecture/FEATURE_STRUCTURE.md) for the target structure.

---

## 💻 Development Workflow (Local)

### 1. Initial Setup

```bash
cp .env.example .env.local
npm install
```

### 2. Database Management

Use the simplified `npm run` commands:

- `npm run db:start`: Start the Docker database.
- `npm run db:setup`: Fast-track (Start + Push + Seed).
- `npm run db:status`: Check if the database is healthy.
- `npm run db:shell`: Enter the PostgreSQL terminal.
- `npm run db:doc`: Generate database schema documentation.

---

## 🛠️ Step-by-Step Feature Implementation

### 1. Define the Domain Entity

Define the core data structure in `src/domain/entities/` (or `src/features/{feature}/domain/entities/` in the target structure).

### 2. Define the Repository Interface (Port)

Define how the application layer will interact with data in `src/application/repositories/` (or `src/features/{feature}/application/ports/`).

### 3. Implement Infrastructure

- **Schema**: `src/infrastructure/database/schema/` (or `src/features/core/infrastructure/persistence/`)
- **Repository Implementation**: `src/infrastructure/repositories/` (or `src/features/{feature}/infrastructure/persistence/`)

### 4. Create the Application Service

Implement business logic in `src/application/services/` (or `src/features/{feature}/application/services/`).

### 5. Create Page and Components

Create your route in `src/app/[locale]/...` and build your components there.

- **Server Components**: (Default) `page.tsx` and co-located components.
  > **Note (Next.js 16)**: `params` and `searchParams` are now **Promises**. You must `await` them before accessing properties:
  >
  > ```tsx
  > export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  >   const { slug } = await params;
  >   // ...
  > }
  > ```
- **Client Components**: (`'use client'`) For user interaction.
- **Shared Components**: If reusable, check `src/components/common` or `src/components/ui` (or `src/features/core/ui/` in the target structure).

---

## 🧪 Staging & Production

### Environment Overview

| Environment     | Purpose      | Database  | Config File       | URL                  |
| :-------------- | :----------- | :-------- | :---------------- | :------------------- |
| **Development** | Local coding | Docker    | `.env.local`      | `localhost:3000`     |
| **Staging**     | QA           | Dedicated | `.env.staging`    | `staging.findeg.com` |
| **Production**  | Live         | Managed   | `.env.production` | `findeg.com`         |

### Deployment Best Practices

- **Build**: `npm run build` (Static translations are fetched here).
- **SSL**: Production connections must use `?sslmode=require`.
- **Secrets**: Never commit `.env` files.
- **Migrations**: Run `db:migrate` before switching traffic.
