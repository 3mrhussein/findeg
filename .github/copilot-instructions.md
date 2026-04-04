# Copilot Instructions — FindEg Monorepo

## Context

Monorepo using:

- Turborepo
- Next.js v16 (App Router)
- pnpm workspaces

Packages:

- @findeg/ui → shared UI
- @findeg/backend → business logic (Clean Architecture)
- @findeg/dashboard → admin app
- @findeg/storefront → customer app

---

## Core Rules

- Respect package boundaries
- Keep changes minimal and consistent
- Do not introduce new patterns if existing ones exist
- Prefer reuse over new implementations

---

## Dependency Rules

- Apps can import: `@findeg/ui`, `@findeg/backend`
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
- application imports domain only
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

### Caching (MANDATORY)

- Use "use cache" for cacheable data
- Use noStore() for dynamic data
- Avoid implicit caching

Example:

"use cache";

export async function getProducts() {
return db.query.products.findMany();
}

Rules:

- Do not duplicate fetch logic
- Do not call the same query in multiple places
- Extract shared fetch logic into backend

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
  1. Does it exist in @findeg/backend?
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
