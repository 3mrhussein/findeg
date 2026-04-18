# Test Requirements Specification: Architectural Boundary Enforcement

**Feature**: 005-decouple-app-infrastructure  
**Created**: 2026-04-05  
**Purpose**: Define comprehensive test requirements for validating architectural boundaries between apps and backend infrastructure

---

## Test Strategy Overview

### Testing Pyramid

```
       E2E (Bundle Analysis, Build Validation)
              ▲
             / \
            /   \
           /     \
          /       \
    Integration (Cross-Package Imports)
        ▲
       / \
      /   \
     /     \
    /       \
Unit (Exports, Config)
```

### Test Coverage Goals

- **Unit Tests**: 85% coverage for export configuration and enforcement mechanisms
- **Integration Tests**: 100% coverage for cross-package import scenarios (positive + negative)
- **E2E Tests**: 100% coverage for production build validation and runtime behavior

---

## Unit Test Requirements

### 1. Package.json Exports Validation (CHK015-CHK018)

**Objective**: Validate that package.json exports field correctly exposes only application and presentation layers.

**Test Cases**:

#### TC-U001: Verify exports field structure
- **Given**: Backend package.json
- **When**: Parsing exports field
- **Then**: 
  - Exports field exists and is an object
  - All features have corresponding export entries
  - Export entries follow consistent naming convention

#### TC-U002: Verify infrastructure not exposed
- **Given**: Backend package.json exports
- **When**: Scanning all export paths
- **Then**:
  - No paths contain "/infrastructure"
  - No paths expose database schemas
  - No paths expose repository implementations

#### TC-U003: Verify TypeScript definitions exported
- **Given**: Each export entry
- **When**: Validating structure
- **Then**:
  - Each export has both "types" and "default" fields
  - Type definition path matches implementation path
  - Paths point to index.ts barrel files

**Test Data**: Real package.json from @backend

**Expected Outcomes**: All 3 test cases pass, confirming exports properly configured

---

### 2. TypeScript Path Resolution (CHK019-CHK021)

**Objective**: Validate TypeScript configuration enforces layer boundaries.

**Test Cases**:

#### TC-U004: Positive - Allowed imports resolve correctly
- **Given**: Test file importing from backend application layer
- **When**: TypeScript compiles
- **Then**: Compilation succeeds, no errors

#### TC-U005: Positive - Type-only imports work
- **Given**: Test file with `import type` from backend
- **When**: TypeScript compiles  
- **Then**: Type checking passes

#### TC-U006: Negative - Infrastructure imports fail
- **Given**: Test file importing from backend infrastructure
- **When**: TypeScript compiles
- **Then**: Compilation fails with clear error message

**Test Implementation**: Create temporary test files, run tsc, verify results

**Error Messages**:
- "Cannot find module '@backend/features/*/infrastructure/*'"
- "Package subpath './features/*/infrastructure/*' is not defined by 'exports'"

---

### 3. Server External Packages Configuration (CHK022-CHK024)

**Objective**: Document and validate required serverExternalPackages entries.

**Test Cases**:

#### TC-U007: Identify Node.js-only packages
- **Given**: Backend dependencies
- **When**: Analyzing package types
- **Then**: List of packages requiring server-only execution identified

**Expected List**:
- postgres (Node.js driver)
- drizzle-orm (database ORM)
- bcryptjs (crypto)
- jose/jsonwebtoken (JWT)
- sharp (image processing)
- nodemailer (email)

#### TC-U008: Verify backend has no framework dependencies
- **Given**: Backend package.json dependencies
- **When**: Scanning for framework packages
- **Then**:
  - No "react" dependency
  - No "next" dependency
  - No "server-only" dependency

**Pass Criteria**: Backend remains pure TypeScript library

---

## Integration Test Requirements

### 4. Cross-Package Import Validation (CHK025-CHK028)

**Objective**: Validate apps can import allowed layers and infrastructure is blocked.

**Test Cases**:

#### TC-I001: App imports from application layer succeed
- **Given**: Dashboard app
- **When**: Importing types from @backend/features/*/application
- **Then**: TypeScript compilation succeeds
- **And**: Imports resolve correctly

#### TC-I002: App imports from presentation layer succeed
- **Given**: Storefront app
- **When**: Importing hooks from @backend/features/*/presentation
- **Then**: TypeScript compilation succeeds
- **And**: Runtime imports work

#### TC-I003: App infrastructure import fails at compile time
- **Given**: App attempting to import repository
- **When**: Running TypeScript compilation
- **Then**: Build fails with module not found error
- **And**: Error message clearly indicates exports boundary

#### TC-I004: Import chain validation
- **Given**: App component → presentation → application → infrastructure
- **When**: Tracing dependency chain
- **Then**: Apps only see presentation and application layers
- **And**: Infrastructure hidden behind abstraction

**Test Fixtures**:
- Sample valid import statements
- Sample invalid import statements
- Mock backend feature structure

---

### 5. Build-Time Enforcement (CHK029-CHK032)

**Objective**: Validate build fails appropriately when boundaries violated.

**Test Cases**:

#### TC-I005: TypeScript strict mode enforced
- **Given**: All packages (backend, dashboard, storefront)
- **When**: Checking tsconfig.json
- **Then**: strict: true in all compilerOptions

#### TC-I006: Build fails on infrastructure import
- **Given**: Temporary test file importing infrastructure
- **When**: Running `npm run build`
- **Then**: Build fails before bundling
- **And**: Clear error message displayed

#### TC-I007: Error messages are actionable
- **Given**: Various boundary violations
- **When**: Each violation occurs
- **Then**: Error message includes:
  - What was violated
  - Which file caused it
  - How to fix it (use allowed import path)

**Expected Error Format**:
```
Cannot find module '@backend/features/catalog/infrastructure/DrizzleProductRepository'

Package subpath './features/catalog/infrastructure/DrizzleProductRepository' 
is not defined by "exports" in @backend/package.json

Did you mean to import from '@backend/features/catalog' instead?
```

---

### 6. Framework Integration (CHK033-CHK035)

**Objective**: Validate monorepo tooling properly enforces boundaries.

**Test Cases**:

#### TC-I008: Turborepo build dependencies correct
- **Given**: turbo.json configuration
- **When**: test:e2e task runs
- **Then**: build task runs first as dependency

#### TC-I009: pnpm workspace resolution
- **Given**: pnpm-workspace.yaml
- **When**: Apps install dependencies
- **Then**: @backend resolves via workspace:*

#### TC-I010: serverExternalPackages in Next.js config
- **Given**: dashboard/storefront next.config.ts
- **When**: Checking serverExternalPackages
- **Then**: postgres, drizzle-orm, etc. listed

---

## E2E Test Requirements

### 7. Production Build Validation (CHK036-CHK039)

**Objective**: Validate apps build successfully for production without infrastructure leakage.

**Test Cases**:

#### TC-E001: Dashboard builds without errors
- **Given**: Clean workspace
- **When**: `pnpm --filter @dashboard build`
- **Then**: Build completes successfully
- **And**: Exit code 0
- **And**: Build time < 3 minutes

#### TC-E002: Storefront builds without errors
- **Given**: Clean workspace
- **When**: `pnpm --filter @storefront build`
- **Then**: Build completes successfully
- **And**: No module resolution errors logged

#### TC-E003: No infrastructure in build output
- **Given**: Production build artifacts
- **When**: Analyzing build logs
- **Then**: No warnings about bundling postgres, drizzle-orm, fs, net, tls

**Success Criteria**: Both apps build cleanly in CI/CD pipeline

---

### 8. Client Bundle Analysis (CHK040-CHK043)

**Objective**: Verify client bundles don't contain Node.js-only modules.

**Test Cases**:

#### TC-E004: No postgres in client bundle
- **Given**: Built dashboard app loaded in browser
- **When**: Inspecting client JavaScript bundles
- **Then**: "postgres" string not found in client code

#### TC-E005: No drizzle-orm in client bundle
- **Given**: Built storefront app loaded in browser
- **When**: Inspecting client JavaScript bundles
- **Then**: "drizzle" string not found in client code

#### TC-E006: No Node.js modules (fs, net, tls) in client bundle
- **Given**: Client-side JavaScript
- **When**: Searching for require('fs'), require('net'), require('tls')
- **Then**: None found

#### TC-E007: Bundle size regression check
- **Given**: Baseline bundle sizes before refactoring
- **When**: Comparing to post-refactoring bundles
- **Then**: Client bundles same size or smaller
- **And**: No unexpected size increases

**Tooling**: Next.js bundle analyzer, Cypress window inspection

**Baseline Bundle Sizes** (to be measured):
- Dashboard client bundle: TBD
- Storefront client bundle: TBD

---

### 9. E2E Happy Path Scenarios (CHK048-CHK050)

**Objective**: Validate real-world usage works correctly with architectural boundaries.

**Test Cases**:

#### TC-E008: Admin pages load successfully
- **Given**: Built dashboard app
- **When**: User navigates to /admin
- **Then**: Page loads
- **And**: Admin data displayed (using backend features)

#### TC-E009: Product catalog loads successfully
- **Given**: Built storefront app
- **When**: User navigates to /products
- **Then**: Products displayed (fetched via backend)

#### TC-E010: Authentication flow works
- **Given**: Either app
- **When**: User signs in
- **Then**: Auth uses backend identity features
- **And**: Login successful

---

### 10. E2E Error Scenarios (CHK051-CHK054)

**Objective**: Document expected failures when boundaries violated.

**Test Cases**:

#### TC-E011: Build fails if Client Component imports infrastructure
- **Given**: Client Component with infrastructure import
- **When**: Running build
- **Then**: Build fails before E2E runs
- **And**: E2E never executes (can't test in E2E suite itself)

**Note**: This is a negative test - we verify it in integration tests, not E2E

---

### 11. CI/CD Pipeline Integration (CHK044-CHK047)

**Objective**: Ensure tests work as automated gates.

**Test Cases**:

#### TC-E012: Full test pipeline runs successfully
- **Given**: Push to feature branch
- **When**: CI/CD executes `npm run test:e2e`
- **Then**: type-check → unit → build → e2e all pass

#### TC-E013: Pipeline fails on boundary violation
- **Given**: PR with infrastructure import in app
- **When**: CI/CD runs
- **Then**: type-check or build step fails
- **And**: E2E doesn't run
- **And**: PR cannot merge

#### TC-E014: Automated PR review checks
- **Given**: GitHub Actions workflow
- **When**: PR created
- **Then**: Boundary enforcement checks run automatically
- **And**: Results posted as PR comment

---

## Test Data & Fixtures

### Mock Backend Feature Structure (CHK059-CHK062)

```typescript
// Test fixture: Mock feature structure
export const mockFeature = {
  name: "catalog",
  layers: {
    domain: ["entities/Product.ts", "value-objects/Price.ts"],
    application: ["use-cases/CreateProduct.ts", "contracts/IProductRepository.ts"],
    infrastructure: ["DrizzleProductRepository.ts", "persistence/productSchema.ts"],
    presentation: ["hooks/useProducts.ts", "actions/productActions.ts"]
  },
  exports: {
    allowed: ["application", "presentation", "domain"],
    forbidden: ["infrastructure"]
  }
};
```

### Sample Import Statements

**Valid Imports**:
```typescript
import { useProducts } from '@backend/features/catalog';
import type { Product } from '@backend/features/catalog';
import { CreateProductUseCase } from '@backend/features/catalog';
```

**Invalid Imports**:
```typescript
import { DrizzleProductRepository } from '@backend/features/catalog/infrastructure/DrizzleProductRepository';
import { db } from '@backend/features/core/infrastructure/persistence/database.config';
import { productSchema } from '@backend/features/catalog/infrastructure/persistence/productSchema';
```

---

## Test Environment Configuration (CHK063-CHK065)

### Requirements

- **Node.js**: >=18.17.0
- **pnpm**: >=8.6.0
- **TypeScript**: ~5.3.0
- **Vitest**: ^1.0.0
- **Cypress**: ^13.0.0

### CI/CD Environment

- GitHub Actions runners
- Test database: Postgres in Docker container
- Environment variables: TEST_DATABASE_URL

---

## Performance Test Requirements (CHK066-CHK070)

### Build Performance (CHK067, SC-002)

#### TC-P001: Build time within threshold
- **Given**: Clean build
- **When**: Running `time npm run build`
- **Then**: Total time < 3 minutes

#### TC-P002: Type-check performance
- **Given**: All packages
- **When**: Running `npm run type-check`
- **Then**: Completes in < 30 seconds

### Runtime Performance (CHK069-CHK070)

#### TC-P003: Module resolution overhead acceptable
- **Given**: Development server
- **When**: Starting with `npm run dev`
- **Then**: Server ready in < 10 seconds

---

## Test Automation & Reporting (CHK071-CHK076)

### Test Framework Configuration

- **Unit/Integration**: Vitest with node environment
- **E2E**: Cypress with Chrome headless
- **Assertions**: Vitest expect, Cypress chai

### Test Execution Scripts

```json
{
  "test": "pnpm run test:unit && pnpm run test:e2e",
  "test:unit": "vitest run",
  "test:e2e": "start-server-and-test start http-get://localhost:3001 'cypress run'",
  "test:watch": "vitest watch",
  "test:coverage": "vitest run --coverage"
}
```

### Coverage Reporting (CHK075)

- **Format**: HTML + JSON + Text
- **Threshold**: 80% for new boundary enforcement code
- **Reports**: Uploaded to CI artifacts

### Failure Notifications (CHK076)

- **GitHub**: PR check failures
- **Slack**: CI/CD pipeline errors
- **Email**: Daily test summary

---

## Test Maintenance (CHK077-CHK082)

### File Organization (CHK077-CHK078)

```
packages/backend/src/__tests__/
  ├── architectural-boundaries.test.ts      # Unit tests
  ├── cross-package-integration.test.ts     # Integration tests
  └── exports.test.ts                       # Existing exports tests

packages/dashboard/cypress/e2e/
  └── architectural-boundaries.cy.ts        # E2E tests

packages/storefront/cypress/e2e/  
  └── architectural-boundaries.cy.ts        # E2E tests
```

### Naming Conventions

- Unit tests: `*.test.ts`
- Integration tests: `*-integration.test.ts`
- E2E tests: `*.cy.ts`
- Descriptive names matching feature area

### Documentation Integration (CHK079)

- Test requirements link to spec.md
- Architecture docs reference test locations
- README includes test execution guide

---

## Summary

**Total Test Cases Defined**: 38
- Unit: 8 test cases
- Integration: 10 test cases
- E2E: 14 test cases
- Performance: 3 test cases
- CI/CD: 3 test cases

**Coverage Targets**:
- Functional Requirements: 100% (FR-001 through FR-010)
- Success Criteria: 100% (SC-001 through SC-006)
- User Stories: 100% (all 3 stories)

**Test Execution Time Estimates**:
- Unit tests: ~10 seconds
- Integration tests: ~30 seconds
- E2E tests: ~2 minutes
- **Total**: ~3 minutes per full run

**Next Steps**:
1. ✅ Unit tests implemented (architectural-boundaries.test.ts)
2. ✅ Integration tests implemented (cross-package-integration.test.ts)
3. ✅ E2E tests implemented (architectural-boundaries.cy.ts for both apps)
4. Run full test suite: `npm run test`
5. Verify all tests pass
6. Measure coverage and adjust if needed
