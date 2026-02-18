# Frontend Import Conventions

Last updated: 2026-02-17

## Canonical UI Locations
- Global primitives and shared UI atoms: `src/components/ui/*`
- Cross-feature shared view components: `src/components/common/*`
- Shared layout composition: `src/components/layout/*`
- Feature-owned presentation modules: `src/features/<feature>/presentation/*`

## Source Of Truth Decision
- Storefront and feature presentation code should live under `src/features/*/presentation/*`.
- Do not import from `@/presentation/storefront/*`.

## Import Rules
- Prefer feature-local presentation imports for feature pages.
- Use `src/components/ui/*` only for primitive building blocks.
- Use `src/components/common/*` for cross-feature reusable composed components.
- Avoid duplicate aliases/re-exports that point to removed legacy paths.

## Guardrail
- ESLint rejects imports matching:
  - `@/presentation/storefront/*`
  - `src/presentation/storefront/*`
