# Playbook: Ship PR and Review Readiness

## Purpose
Prepare, validate, and document code changes before opening or updating a Pull Request, guaranteeing high reviewer clarity and zero CI failures.

## Phase 1: Pre-flight Verification Gate
1. Run static checks and type assertions:
   ```bash
   pnpm type-check
   pnpm lint
   ```
2. Run test suites across affected workspaces:
   ```bash
   pnpm test
   ```
3. Ensure no uncommitted artifacts or debug logs remain.

## Phase 2: Diff Digest Generation
1. Execute the diff digest analyzer:
   ```bash
   bun scripts/diff-digest.ts origin/develop HEAD
   ```
2. Note the total lines changed, modified symbols, and overall risk index.
3. Review caller list for any high-risk cross-package impacts.

## Phase 3: Structured PR Brief Composition
Construct a PR description containing the following sections:
1. **Summary**: Concise high-level explanation of why the change was made and what it accomplishes.
2. **Key Changes**: Bulleted list of modified modules with evidence links (`path#Lstart-Lend`).
3. **Blast-Radius and Risk**: Overall risk index from `diff-digest.ts` and affected downstream packages.
4. **Verification Evidence**: Commands run and test pass confirmation logs.

## Phase 4: Push and Review
1. Confirm git branch follows naming rules (`<type>/<kebab-case-slug>`).
2. Push branch to remote and trigger review workflows.
