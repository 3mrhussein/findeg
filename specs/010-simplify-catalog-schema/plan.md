# Implementation Plan: Simplify Catalog Schema

**Branch**: `010-simplify-catalog-schema` | **Date**: 2026-05-10 | **Spec**: [/specs/010-simplify-catalog-schema/spec.md](file:///Users/faraga4/Desktop/Moro/Personal/Projects/findeg.stationary/specs/010-simplify-catalog-schema/spec.md)

## Summary

This plan outlines the modernization of the catalog schema by removing unused columns, consolidating media handling to the variant level, and simplifying the attribute and brand models. The primary goal is to align the database with MVP requirements and implement a robust "default variant" fallback pattern for product display.

## Technical Context

**Language/Version**: TypeScript / Node.js 20+  
**Primary Dependencies**: Next.js 16, Drizzle ORM, Zod, Tailwind CSS  
**Storage**: PostgreSQL (via Drizzle)  
**Testing**: Vitest (Backend), Cypress (Frontend)  
**Target Platform**: Web (Admin Dashboard & Storefront)
**Project Type**: Monorepo Web Application  
**Performance Goals**: N/A (MVP Schema optimization)  
**Constraints**: Clean Architecture (4-layer), Strict Type-safety  
**Scale/Scope**: Catalog Domain (Products, Variants, Brands, Attributes)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**FindEg.com Constitution (.specify/memory/constitution.md) Compliance Gates** — Test each principle:

1. **✅ Clean Architecture** - Feature will use domain/application/infrastructure/presentation layers; no infrastructure imports between features.
2. **✅ Server-Components First** - UI will default to Server Components; Client Components (ProductDetailClient) will be updated for fallback logic.
3. **✅ Bilingual & RTL-First** - All brands will now use `localizedName` (i18n first); Tailwind logical classes preserved.
4. **✅ Feature-Oriented Core Kernel** - Feature depends on `core` only; self-contained in `catalog` and `administration` features.
5. **✅ Type-Safe & Testable** - Zod schemas updated in `backend/src/features/catalog/domain/entities/`; TypeScript strict checked.
6. **✅ DRY Principle** - Fallback logic for `mediaSet` and `basePrice` will be centralized in the variant selection logic.
7. **✅ SOLID Design** - Repositories and Services refactored to focus on simplified data models.
8. **✅ Definition of Done** - Plan includes type-check, build, and verification of seed data.

**Violations found**: None.

## Project Structure

### Documentation (this feature)

```text
specs/010-simplify-catalog-schema/
├── plan.md              # This file
├── research.md          # Research findings and decisions
├── data-model.md        # Detailed entity mappings
├── quickstart.md        # How to apply changes and seed
└── tasks.md             # Task breakdown (generated separately)
```

### Source Code Impact

```text
db/
├── src/schema/catalog/
│   ├── brands.ts             # Remove isActive, name
│   ├── products.ts           # Remove mediaSet
│   ├── product-variants.ts   # Add mediaSet, remove lowStockThreshold, displayOrder
│   └── product-attributes.ts # Rename table, remove scope, isVariantDefining, valueNum, valueBool
└── seeds/
    └── data/                 # Update JSON seed files

backend/
├── src/features/catalog/
│   ├── domain/entities/      # Update Product, Variant, Attribute, Brand
│   └── infrastructure/persistence/ # Update repositories
└── src/features/administration/
    ├── application/services/ # Update AdminProductService
    └── domain/types/         # Update input schemas (Zod)

frontend/
├── dashboard/src/app/.../products/ # Update forms and tables
└── storefront/src/app/.../shop/    # Update ProductCard and PDP fallback logic
```

**Structure Decision**: Standard monorepo structure. All changes are internal to the identified packages and layers.

## Verification Plan

### Automated Tests
- `npm run type-check` across all packages.
- `npm run db:push` followed by `npm run seed` to verify schema and data.
- `vitest backend/src/features/catalog/domain/entities/__tests__` (if applicable).

### Manual Verification
- Check Admin Dashboard: Brand list (no isActive), Product list, Variant edit form.
- Check Storefront: Product listings and details render images/prices correctly from default variants.
