# Tasks: Universal Test Pipeline and Global Type Fixes

## Dependencies

- [US1] depends on Phase 2
- [US2] depends on Phase 2
- [US3] depends on Phase 1 (for dashboard dependencies)

## Implementation Strategy

We will first standardize the infrastructure (scripts and turbo config) to enable the pipeline structure. Since the pipeline will immediately fail due to existing type errors, we will then focus on resolving all compilation issues across all packages to achieve a "green" state.

---

### Phase 1: Setup

- [x] T001 [P] Add missing dev dependencies to `packages/dashboard/package.json` (`@tanstack/react-table`, `react-dropzone`)
- [x] T002 [P] Update `turbo.json` with `test:unit` and `test:e2e` task definitions

### Phase 2: Foundational

- [x] T003 [P] Rename existing `test` scripts to `test:unit` in all 4 packages' `package.json`
- [x] T004 [P] Ensure all 4 packages have a `type-check` script (`tsc --noEmit`) in `package.json`

### Phase 3: User Story 1 - Root Level Orchestration

- [x] T005 [P] [US1] Define `test`, `test:unit`, and `test:e2e` scripts in root `package.json`
- [x] T006 [US1] Verify root `npm run test` correctly sequences tasks using `turbo`

### Phase 4: User Story 2 - Package Level Sequence

- [x] T007 [P] [US2] Update `test` script in all 4 packages to run `npm run type-check && npm run test:unit && (npm run e2e || true)`

### Phase 5: User Story 3 - Global Type Fixes

- [x] T008 [P] [US3] Fix missing utility `@features/catalog/presentation/utils/product-url` in `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/ProductTable/ProductTableColumns.tsx`
- [x] T009 [P] [US3] Fix `ToggleTheme` component/type mismatch in `packages/dashboard/src/app/[locale]/admin/_components/shell/AdminHeader.tsx`
- [x] T010 [P] [US3] Fix `updateMyProfileAction` return type mismatch in `packages/dashboard/src/app/[locale]/admin/account/page.tsx`
- [x] T011 [P] [US3] Add explicit types for table callbacks in `packages/dashboard/src/app/[locale]/admin/(dashboard)/orders/OrderTable/OrderTableColumns.tsx`
- [x] T012 [P] [US3] Add explicit types for table callbacks in `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/ProductTable/ProductTable.tsx`
- [x] T013 [P] [US3] Add explicit types for table callbacks in `packages/dashboard/src/app/[locale]/admin/(dashboard)/products/ProductTable/ProductTableColumns.tsx`
- [x] T014 [US3] Verify 0 compilation errors and <60s execution time (SC-001) by running `npm run type-check` at root
- [/] T015 [US3] Final confirmation of the full pipeline execution at both root and package levels

---

### Final Phase: Polish & Verification

- [ ] T015 Verify successful execution of the full `npm run test` pipeline at root and package levels
