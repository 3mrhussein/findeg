# Component Placement (Strict)

This project enforces a strict rule: **React components (JSX) do not live inside feature presentation**.

The allowed locations for components are intentionally limited to keep the architecture predictable and prevent “UI leaking” into feature layers.

## The 4 Allowed Locations

### 1) `src/components/ui/`

**What belongs here:** shadcn/Radix-style primitives (buttons, inputs, dialogs, table primitives).

**Rule of thumb:**

- Low-level, design-system primitives
- Highly reusable and styling-focused
- No business meaning

### 2) `src/components/shared/`

**What belongs here:** cross-cutting components reused across multiple routes/features.

**Examples:**

- `TagBadge`
- bilingual input helpers (`BilingualInput`, `BilingualTextarea`)

**Rule of thumb:**

- Reused across admin + storefront, or across multiple distinct route groups
- Still “presentation”, but not tied to a single route

### 3) `src/app/**/_components/`

**What belongs here:** route-colocated components.

**Rule of thumb:**

- A component used by one page or one route group
- UI that depends on route params, page-specific layout, or local UX needs

**Example locations:**

- `src/app/[locale]/admin/(dashboard)/products/_components/**`
- `src/app/[locale]/(storefront)/school/_components/**`

### 4) `src/features/**/presentation/` (NO JSX)

**What belongs here:** presentation-layer code that is _not_ React components.

Allowed examples:

- hooks (`useXxx.ts`)
- mappers/adapters (`*-mapper.ts`)
- config (`config/*.ts`, display rules)
- schemas/types used by UI (e.g., Zod schemas)

Forbidden:

- `.tsx` UI components
- any file containing JSX

## Decision Tree

1. Is it a shadcn/Radix-style primitive?
   - Yes → `src/components/ui/`
2. Is it reused across multiple route groups/features?
   - Yes → `src/components/shared/`
3. Is it only used within a specific route (or route group)?
   - Yes → `src/app/**/_components/`
4. Otherwise, it’s probably not a component.
   - Put hooks/mappers/config under `src/features/**/presentation/` (no JSX)

## Enforcement

ESLint enforces:

- no JSX under `src/features/**/presentation/**`
- no imports from `@/features/**/presentation/components/**`

If you need UI in a feature, move it to route `_components` or shared components instead of adding exceptions.
