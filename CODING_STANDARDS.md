# Coding standards

Shared tooling now lives in `configs/` (#435), with compatibility delegates and Turbo
cache/change-selection inputs. Existing lint and test behavior is preserved.
Complete preset/naming configuration (#436) is available through staged opt-in;
see [activation and measured violations](configs/eslint/rollout.md). Shared coverage/test
placement (#437) is implemented with staged activation; see
[the Vitest policy](configs/vitest/README.md). Environment relocation (#438) and measured
full activation/delegate removal (#445) remain pending.
See [the delegate inventory](configs/compatibility.md). The rules below are the agreed targets.

## Global

- Extend `@eslint/js` recommended and TypeScript `strictTypeChecked` presets.
- Add React, Hooks, accessibility, Next.js, and Node presets where applicable.
- Preserve preset checks. Use narrow, justified overrides.
- Use Prettier for formatting. Next.js handles server/client boundaries.
- Keep shared configuration under `configs/`: `eslint/`, `env/`, `tsconfig/`, `vitest/`, etc.
- Tool-required entry files may reference `configs/`. Environment validation stays consumer-specific.

## Naming

- Non-function `const`: camelCase or UPPER_SNAKE_CASE.
- Functions, including function-valued constants: camelCase.
- Types, interfaces, enums, classes: PascalCase.
- React components in `.tsx`: PascalCase, including aliases, `memo`, and `forwardRef` results.
- Functions in `.ts` and ordinary functions in `.tsx`: camelCase.
- Apply naming to local declarations. Preserve external property names; alias locally when needed.

## Libraries under `packages/`

These structure rules apply recursively. UI libraries and apps do not inherit them.

- Source files: `index.ts`, `types.ts`, `constants.ts`, `helpers.ts`.
- JSX files: `index.tsx`, `helpers.tsx`.
- Directories: `helpers/`, `features/`, named features inside `features/`, and `__tests__/`.
- Use either a helper file or folder. Index files may contain implementation.
- Modules export through their index; parent indexes re-export child public APIs.
- Package exports expose only the root index and `types.ts`.
- Implementation directories require executable tests in `__tests__/`.
- Types/constants-only and re-export-only directories need no local tests.
- Metadata, configuration entries, generated files, and test filenames are exempt.

## Vitest

- Discover tests automatically in `__tests__/`; validate required library test directories.
- Require 80% per implementation file for lines, statements, functions, and branches.
- Include implementation files never imported by tests, including index and helper files.
- Exclude `constants.ts` and `types.ts` from coverage, including nested files.
