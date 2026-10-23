# Playbook: Investigation and Root Cause Analysis

## Purpose
Systematically isolate the root cause of an unexpected failure, regression, or unexplained behavior without making speculative code modifications.

## Phase 1: Symptom Capture and Reproduction
1. Record the exact failure signature (error message, stack trace, HTTP status code, or unexpected output).
2. Identify the minimal reproduction command or test case:
   ```bash
   pnpm --filter <package> run test <test-file>
   ```
3. If no reproduction test exists, establish one in a scratch file or isolated test harness before inspecting production code.

## Phase 2: Evidence Gathering via Deterministic Tooling
1. Identify boundaries touching the failure area:
   ```bash
   bun scripts/system-xray.ts .
   ```
2. Locate the specific functions or classes referenced in the stack trace.
3. Extract only the relevant symbols with exact line numbers:
   ```bash
   bun scripts/extract-symbol.ts <file-path> <symbol-name> --exact
   ```
4. Note the file path and line numbers (example: `backend/src/services/order.ts#L88-L115`).

## Phase 3: Invariant and Data-Flow Tracing
1. Trace inputs arriving at the boundary:
   - What data type enters the function?
   - What preconditions does the function assume?
2. Identify where assumptions break:
   - Null or undefined field access?
   - State mutation across asynchronous boundaries?
   - Database constraint violation?
3. Cite the exact code line responsible for the deviation.

## Phase 4: Root Cause Summary
Deliver a structured investigation verdict containing:
- Failure Signature: Exact exception and conditions.
- Primary Location: `file://<absolute-path>#L<start>-L<end>`
- Causal Chain: Step 1 -> Step 2 -> Failure.
- Proposed Resolution Path: Architectural fix without speculative churn.
