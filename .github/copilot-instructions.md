# Copilot Instructions — FindEg Stationary (Next.js 16)

You are a coding agent in a **Next.js 16 App Router** repo with a **Clean Architecture / feature-first** structure.

Primary goals when making changes:

- Keep layer boundaries intact (domain/application/infrastructure/ui)
- Keep UI predictable via strict component placement
- Keep type-safety + i18n standards high
- Keep changes minimal and consistent with existing patterns

## Essential commands (run before PR)

- Dev server: `npm run dev`
- Type check: `npm run type-check`
- ESLint: `npm run lint:eslint`
- Full lint gate (required): `npm run lint` (runs type-check + eslint)
- Build gate: `npm run build`
- Auto-fix lint: `npm run lint:fix`

E2E (Cypress):

- `npm run e2e:run`
- `npm run e2e:run:ci`

Database (Docker + Postgres):

- Start: `npm run db:start`
- One-shot local setup: `npm run db:setup`
- Reset (destructive): `npm run db:reset`
- Shell: `npm run db:shell`

See: `README.md` and `docs/database/SETUP.md`

## Common gotchas

- This repo is ESM (`"type": "module"` in `package.json`). Prefer ESM import syntax in Node scripts and avoid CommonJS-only patterns.
- Shell globbing: paths like `src/app/[locale]/...` contain brackets/parentheses; when using shell tools (zsh), quote paths to avoid glob expansion (e.g. `rg "src/app/\[locale\]/"` or `ls "src/app/[locale]"`).

## Repo structure (what goes where)

- Routes (App Router + locale): `src/app/[locale]/...`
- Shared primitives (shadcn/Radix): `src/components/ui/`
- Shared cross-cutting components: `src/components/shared/`
- Feature modules: `src/features/<feature>/{domain,application,infrastructure,presentation}/`
- Shared kernel: `src/features/core/...`

Reference docs:

- Architecture source of truth: `docs/architecture/ARCHITECTURE_PLAYBOOK.md`
- Clean-arch conventions: `docs/development/conventions.md`
- Coding standards: `docs/guides/CODING_STANDARDS.md`
- Development workflow: `docs/guides/DEVELOPMENT.md`

## Clean Architecture boundaries (import rules)

Follow the contracts in `docs/architecture/ARCHITECTURE_PLAYBOOK.md`:

- `domain`: pure types/business rules; no framework deps
- `application`: orchestrates use cases; defines interfaces (`I*Service`, `I*Repository`)
- `infrastructure`: implements adapters (DB/SDK/etc); keep DB details here
- UI/routes: render + interact; **no direct DB/ORM usage**

Hard rules:

- Do NOT import another feature’s `infrastructure` directly. Depend only on interfaces/contracts.
- Do NOT do “role-string checks” in UI/routes. Use permission guard interfaces (e.g. `IPermissionService`).

## Component placement (STRICT — enforced)

React components (JSX) are only allowed in these 3 UI locations:

1. `src/components/ui/` — primitives only
2. `src/components/shared/` — reusable across multiple route groups/features
3. `src/app/**/_components/` — route-colocated UI

`src/features/**/presentation/` is allowed for **presentation logic only** (NO JSX):

- hooks (`useXxx.ts`)
- mappers/adapters (`*-mapper.ts`)
- config
- schemas/types used by UI (e.g. zod schemas)

Source of truth: `docs/development/component-placement.md`

ESLint enforces:

- no JSX in `src/features/**/presentation/**`
- no imports from `features/**/presentation/components/**` or `features/**/presentation/hoc/**`

See: `eslint.config.js`

## i18n rules (must follow)

- Routes are under `src/app/[locale]/...`.
- Do not introduce hardcoded UI strings; add translations for both English + Arabic.
- Translations live in: `src/features/core/infrastructure/cms/messages/{locale}.json`
- Use scoped namespaces: `Pages.{PageName}` (see `docs/guides/CODING_STANDARDS.md`).
- Ensure RTL support: prefer logical Tailwind classes (e.g. `ps-*` vs `pl-*`).

## UI standards

From `docs/guides/CODING_STANDARDS.md`:

- Prefer **Server Components by default**; use `'use client'` only for interactivity (forms/state).
- Use semantic Tailwind tokens (defined in `src/app/globals.css`) rather than hardcoding colors in new code.
- For listing pages, follow existing layout patterns (e.g. `PageShell`, listing layout components).
- Keep mapping/transformation logic out of UI when a presentation mapper exists.

## DB / schema change workflow (when applicable)

Follow `docs/guides/DEVELOPMENT.md` + `docs/architecture/ARCHITECTURE_PLAYBOOK.md`:

1. Update schema in `src/features/core/infrastructure/persistence/schema/`
2. Add migration SQL in `scripts/migrations/`
3. Validate locally (`npm run db:setup`, then CRUD path)
4. Update planning docs as needed (`project-planning/*`)

## Definition of done (minimum)

- `npm run type-check` passes
- `npm run lint` passes
- New strings added to both locales
- Architecture boundaries respected
- Docs updated when behavior/architecture changes

## Active Technologies
- TypeScript 5.x with Next.js 16 (App Router), React 19 + Turborepo (monorepo orchestration), pnpm workspaces (dependency linking), Next.js 16, React 19, Drizzle ORM, Zod (validation), next-intl (i18n), shadcn/ui with Radix UI primitives, Tailwind CSS (001-separate-admin-project)
- PostgreSQL (shared database accessed via backend package's repository interfaces) (001-separate-admin-project)

## Recent Changes
- 001-separate-admin-project: Added TypeScript 5.x with Next.js 16 (App Router), React 19 + Turborepo (monorepo orchestration), pnpm workspaces (dependency linking), Next.js 16, React 19, Drizzle ORM, Zod (validation), next-intl (i18n), shadcn/ui with Radix UI primitives, Tailwind CSS
