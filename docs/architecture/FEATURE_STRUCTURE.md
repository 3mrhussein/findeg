# Feature Structure

This document describes the standard structure of a feature folder and the conventions used across the FindEg codebase.

---

## Standard Feature Layout

Each feature under `src/features/` follows this structure:

```
features/{feature-name}/
├── domain/           # Business entities, value objects, types
│   ├── entities/
│   ├── value-objects/
│   ├── types/        # Optional: input DTOs
│   └── index.ts
├── application/      # Use cases, ports (interfaces), services
│   ├── ports/
│   ├── services/
│   └── index.ts
├── infrastructure/   # Concrete implementations (repos, adapters)
│   └── persistence/
│   └── ...
├── ui/               # React components specific to this feature
│   └── ...
└── index.ts          # Barrel export
```

---

## Layer Responsibilities

### domain/

- **No outward dependencies.** Domain only imports from other domain files or standard TypeScript/JS.
- Contains: entities (interfaces + rich entity classes), value objects, DTOs.
- Business logic belongs here (e.g., `ProductEntity.calculatePrice()`, `CartEntity.getTotalPrice()`).

### application/

- Depends on: `domain/`, and optionally other features' `ports/` (interfaces only).
- Contains: ports (repository/service interfaces), services (use case implementations).
- Never imports from `infrastructure/` — dependency inversion.

### infrastructure/

- Depends on: `domain/`, `application/` (implements ports).
- Contains: Drizzle repositories, external API clients, storage adapters.
- Implements interfaces defined in `application/ports/`.

### ui/

- Depends on: `domain/` (for prop types), `application/` (for typing), `@/components/ui` (shadcn primitives).
- Contains: React components used in pages and layouts.
- No direct infrastructure imports — data flows via props or hooks.
- **Note**: shadcn components (Button, Input, Card, etc.) remain at `src/components/ui/` for CLI consistency.

---

## Import Rules

| From | Can Import |
|------|------------|
| domain | Other domain files, std lib |
| application | domain, other features' ports |
| infrastructure | domain, application ports |
| ui | domain, application interfaces, core/ui, lib |

---

## Adding a New Feature

1. Create `src/features/{feature-name}/`.
2. Add `domain/entities/`, `domain/index.ts`.
3. Add `application/ports/`, `application/services/`, `application/index.ts`.
4. Add `infrastructure/` if the feature has persistence or external integrations.
5. Add `ui/` if the feature has dedicated components.
6. Add `index.ts` barrel at feature root.
7. Register services in `core/infrastructure/di/ServiceContainer.ts`.
8. Expose via `server/getServices.ts`.
9. Add path alias in `tsconfig.json` if desired.

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Feature folder | lowercase | `catalog`, `administration` |
| Entity file | PascalCase, singular | `Product.ts`, `Cart.ts` |
| Port (interface) | I + PascalCase | `IProductRepository.ts` |
| Service | PascalCase + Service | `ProductService.ts` |
| Repository impl | Drizzle + Entity + Repository | `DrizzleProductRepository.ts` |
| Component | PascalCase | `ProductCard.tsx` |
