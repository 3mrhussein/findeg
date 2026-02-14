# Development & Infrastructure Guide

This guide provides a comprehensive workflow for developing, managing, and deploying the FindEg platform.

## 🧱 Architectural Layers

1.  **Domain (Core)**: Entities, Value Objects, and Domain Types.
2.  **Application (Rules)**: Service Interfaces, Use Cases, Repository Interfaces.
3.  **Infrastructure (Details)**: Database (Drizzle), API Clients, CMS Adapters.
4.  **Presentation (UI)**: Next.js Pages (Routes), Co-located Components, Shared UI.

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

Define the core data structure in `src/domain/entities/`.

### 2. Define the Repository Interface

Define how the application layer will interact with data in `src/application/repositories/`.

### 3. Implement Infrastructure

- **Schema**: `src/infrastructure/database/schema/`
- **Repository Implementation**: `src/infrastructure/repositories/`

### 4. Create the Application Service

Implement business logic in `src/application/services/`.

### 5. Create Page and Components

Create your route in `src/app/[locale]/...` and build your components there.

- **Server Components**: (Default) `page.tsx` and co-located components.
- **Client Components**: (`'use client'`) For user interaction.
- **Shared Components**: If reusable, check `src/components/common` or `src/components/ui`.

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
