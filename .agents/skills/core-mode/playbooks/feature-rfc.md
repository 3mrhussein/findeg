# Playbook: Feature RFC and Architectural Design

## Purpose
Structure technical design for non-trivial features, new domain packages, cross-boundary contracts, and database schema updates before implementation begins.

## Phase 1: Context and Problem Definition
1. Detail the business problem, user story, or architectural deficiency.
2. Run boundary inventory to map existing packages:
   ```bash
   bun scripts/system-xray.ts .
   ```
3. Establish non-goals to prevent scope expansion.

## Phase 2: Type Contracts and Interface Design
1. Draft the TypeScript types and interfaces first:
   - Request and response payloads.
   - Domain entity representations.
   - Event schemas and pub/sub channels.
2. Verify contracts against existing schemas using `extract-symbol.ts`.
3. Ensure no implicit `any` or loose string primitives are introduced for domain concepts.

## Phase 3: Blast-Radius and Impact Assessment
1. Determine which packages and callers will be affected:
   ```bash
   bun scripts/diff-digest.ts
   ```
2. Check database migrations:
   - Does this require table creation, column addition, or destructive index alteration?
   - Is backward compatibility maintained during rolling deployments?
3. Check environment variables:
   - Are new environment variables required?
   - Validate them via schema definitions in `configs/env`.

## Phase 4: Implementation Breakdown
1. Divide work into incremental steps:
   - Step 1: Type contracts and domain error definitions.
   - Step 2: Database schema and migrations.
   - Step 3: Domain service logic and unit tests.
   - Step 4: UI integration and end-to-end verification.
2. Define explicit rollback procedures for each phase.
