# Scaling & Standards Guide

This document outlines the standards for maintaining a clean, scalable codebase as the FindEg platform grows.

## Scaling Strategies

### 1. Feature-Based Organization
- Code is organized by **features** (catalog, cart, order, identity, administration, review, media).
- Each feature is self-contained: `domain/`, `application/`, `infrastructure/`, `ui/`.
- Shared cross-cutting code lives in the **core** feature.
- See [DDD & Clean Architecture Refactor Plan](../architecture/DDD_CLEAN_ARCHITECTURE_REFACTOR_PLAN.md) and [Feature Structure](../architecture/FEATURE_STRUCTURE.md).

### 2. Component Modularization
- Split large components into smaller files within the feature folder.
- Add new shadcn components via CLI to `src/components/ui/` (default path).
- Move feature-specific components to `features/{feature}/ui/`.

### 3. State Management
- **URL as Truth**: Use search parameters for filters and pagination.
- **Server State**: Leverage Next.js Cache and `revalidatePath`.

### 4. Service Decomposition
- Split large services into specialized ones (e.g., `ProductSearchService`).
- Use the **Service Container** (in `core/infrastructure/di/`) for dependency orchestration.

---

## Code Quality Standards

- **Strict Typing**: Avoid `any`. Use interfaces from the `domain/` or `features/*/domain/` layer.
- **Type Inference**: Prefer inference where types are obvious; use explicit types for public APIs.
- **JSDoc**: Document public interfaces, service methods, and non-obvious logic with `@param`, `@returns`.
- **Linting**: Run `npm run lint` regularly.
- **Performance**: Use `<Image />` from `next/image` and keep bundles small.
- **i18n**: Add new keys to `lib/i18n.ts` and ensure RTL support.

---

## Developer Roadmap
1. **Caching**: Redis/Edge caching for high-traffic pages.
2. **Feature Extraction**: Feature-based structure enables extracting features to microservices later.
3. **Testing**: Add Unit and Integration tests.
