# Research: Universal Test Pipeline and Global Type Fixes

## Problem Analysis

The monorepo lacks a coordinated, sequential test pipeline. Current `npm run test` commands are inconsistent (some run unit tests, some run type-checks, some are missing). Additionally, existing TypeScript compilation errors in `@findeg/dashboard` block CI/CD and developer testing.

## Audit Results

### Package Scripts

| Package        | `type-check`           | `test`         | `test:unit`                  | `test:e2e`    |
| -------------- | ---------------------- | -------------- | ---------------------------- | ------------- |
| **Root**       | `turbo run type-check` | -              | -                            | -             |
| **backend**    | `tsc --noEmit`         | `vitest --run` | Missing (implicit in `test`) | `cypress run` |
| **dashboard**  | `tsc --noEmit`         | `vitest`       | Missing (implicit in `test`) | `cypress run` |
| **storefront** | `tsc --noEmit`         | `vitest`       | Missing (implicit in `test`) | `cypress run` |
| **ui**         | `tsc --noEmit`         | Missing        | Missing                      | Missing       |

### Dashboard Type Errors

- **Missing Deps**: `@tanstack/react-table`, `react-dropzone`.
- **Implicit any**: Function parameters in `OrderTableColumns.tsx`, `ProductTable.tsx`, and `ProductTableColumns.tsx`.
- **Component Mismatch**: `ToggleTheme` usage in `AdminHeader.tsx`.
- **Action Type Mismatch**: `updateMyProfileAction` in `account/page.tsx` needs updated return types.

## Proposed Strategy

1.  **Standardize Scripts**:
    - Rename `test` → `test:unit`.
    - New `test` = `type-check && test:unit && test:e2e`.
2.  **Global Orchestration**:
    - Define `test`, `test:unit`, `test:e2e` in root `package.json` using `turbo`.
3.  **Resolve Dashboard Errors**:
    - Add missing dependencies.
    - Type all table callbacks.
    - Fix component imports.

## Alternatives Considered

- **Parallel Testing**: Rejected in favor of the user's explicit request for a sequential pipeline (`type-check` first).
- **Lax Types**: Rejected in favor of absolute 0-error build.
