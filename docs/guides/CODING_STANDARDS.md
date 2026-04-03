# Coding Standards & Best Practices

This document defines the engineering standards for FindEg. All developers and AI agents must follow these guidelines to ensure codebase consistency, maintainability, and type safety.

---

## 🏗️ 1. Architecture & Layers

We follow **Clean Architecture** and **Feature-Oriented** structure.

- **Domain**: Pure business logic, entities, and zod schemas. No framework dependencies.
- **Application**: Business services (`I*Service`) and ViewModels. Handles orchestration.
- **Infrastructure**: Database implementations (Drizzle), external APIs, and persistence.
- **Presentation**: UI components and Next.js routes.

### Layer Rules

1. **No direct DB calls in UI**: All data fetching must go through a Service or ViewModel.
2. **ViewModel Pattern**: Listing pages MUST use a `get*PageViewModel()` function in the application layer to prepare data for the view.
3. **Boundaries**: Never import from `infrastructure` or `application` directly in common UI components (except for type definitions).

---

## 🎨 2. Frontend Standards

### Shared Layouts

- **PageShell**: Every page should be wrapped in `<PageShell>` to ensure consistent backgrounds and max-widths.
- **ProductListingLayout**: All listing pages (Shop, Categories, Collections, Search) MUST use this shared layout component.

### Components

- **Server First**: Use Server Components by default. Only use `'use client'` for interactive elements (forms, buttons, state).
- **No `as any`**: Strict type safety is required. If a type mismatch occurs, fix the interface or use a proper type adapter.
- **Primitive UI**: Use `src/components/ui/` for shadcn primitives only.
- **Empty States**: Use the `<EmptyState>` component for non-results or empty views.
- **Design Tokens**: Use semantic Tailwind token classes from `src/app/globals.css` (`bg-primary`, `bg-surface`, `text-foreground`, `text-text-muted`, etc.) instead of hardcoded colors in new code.
- **Icon Actions**: Wrap Lucide icon-only actionable controls with `<IconTooltip />` and provide a meaningful `label`.

### Imports

- Group imports at the top of the file.
- Order: React/Third-party -> Feature Core/Shared -> Domain/Application -> Components/Assets.
- Maintain a clean gap between import groups.

---

## 🌍 3. Internationalization (i18n)

- **Scoped Namespaces**: Use the `namespace: "Pages.{PageName}"` pattern with `getTranslations()` or `useTranslations()`.
- **JSON Sources**: All translations live in `src/features/core/infrastructure/cms/messages/{locale}.json`.
- **No Hardcoded Strings**: Every piece of UI text must be translated.
- **RTL Support**: Use logical properties (e.g., `ps-4` instead of `pl-4`) and ensure layout works for both EN and AR.
- **Arabic Typography**: Use `font-sans` as the default app font. Arabic pages (`html[lang=\"ar\"]`) automatically switch to Cairo through global font tokens.

---

## 🔐 4. Type Safety

- **Zod Schemas**: Use Zod for runtime validation at API and entry boundaries.
- **Strict Interfaces**: Avoid optional properties unless truly optional. Prefer exhaustive unions for status fields.
- **Canonical Types**: Use the `Product`, `Category`, and `Brand` types defined in the domain layer.

---

## ✅ 5. Definition of Done

1. **Type Check**: `npm run type-check` passes with zero errors.
2. **Lint**: `npm run lint` passes without warnings.
3. **i18n**: New strings are added to BOTH `en.json` and `ar.json`.
4. **Consistency**: Follows established patterns (ViewModel, PageShell, etc.).
5. **Documentation**: Affected feature READMEs or guides are updated.
