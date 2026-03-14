---
description: "Use when editing Next.js App Router routes/layouts/pages in src/app/**. Covers Server Components defaults, PageShell/layout rules, and i18n (next-intl) requirements."
applyTo: "src/app/**"
---

# App Router (src/app/\*\*) — Server Components + i18n + layout

- Prefer **Server Components by default**. Add `'use client'` only for real interactivity (forms/state/effects).
- Do not introduce hardcoded UI strings. Use `next-intl` translations with scoped namespaces: `Pages.{PageName}`.
  - Translation sources: `src/features/core/infrastructure/cms/messages/{locale}.json`.
- All routes are under `src/app/[locale]/...`; keep locale-aware routing consistent.
- Use existing layout patterns:
  - Wrap pages with `PageShell` where the app’s page layout expects it.
  - Listing pages should use the shared listing layout pattern (see coding standards).
- Never access DB/ORM directly from routes/components. Fetch via application services / view models.
- UI styling: use semantic Tailwind tokens from `src/app/globals.css` (avoid hardcoded colors in new code).

References:

- `docs/guides/CODING_STANDARDS.md` (UI + i18n + PageShell)
- `docs/architecture/ARCHITECTURE_PLAYBOOK.md` (boundaries)
- `docs/development/component-placement.md` (route `_components`)
