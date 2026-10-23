# Playbook: Bug Fix and Regression Shield

## Purpose
Resolve verified defects cleanly using minimal diffs, zero collateral regression, and mandatory automated test reproduction.

## Phase 1: Failing Test Construction (Red Phase)
1. Write a focused unit or integration test reproducing the exact defect.
2. Run the test to confirm it fails with the expected error signature:
   ```bash
   pnpm test <path-to-test>
   ```
3. Never write application code changes until the test fails reliably.

## Phase 2: Surgical Modification (Green Phase)
1. Inspect the target symbol using surgical extraction:
   ```bash
   bun scripts/extract-symbol.ts <file-path> <symbol-name> --exact
   ```
2. Apply the minimal necessary patch to make the test pass.
3. Rerun the test to confirm success.
4. Run full package test suite to verify no regressions:
   ```bash
   pnpm --filter <package-name> run test
   ```

## Phase 3: Blast-Radius and Downstream Impact Audit
1. Run diff digest to review file changes and caller blast-radius:
   ```bash
   bun scripts/diff-digest.ts
   ```
2. Verify that modified symbols do not break existing downstream callers in adjacent packages.
3. Confirm risk level remains Low or Medium.

## Phase 4: Clean Commit Verification
1. Run linting and type checks:
   ```bash
   pnpm type-check
   pnpm lint
   ```
2. Format commit message adhering to conventional commit standards (`fix(<scope>): <short description>`).
