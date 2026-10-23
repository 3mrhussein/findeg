---
name: rfc-architect
description: "Technical design and RFC architect for system changes, new packages, and boundary shifts. Formulates formal interface specifications, migration plans, and trade-off matrices. Use when drafting architectural RFCs or designing new capabilities."
---

# RFC Architect

`rfc-architect` governs technical design proposals, architectural decision records (ADRs), and formal RFC documents. It demands complete data modeling and blast-radius accounting before writing production code.

## Core Directives

1. **Topology Awareness**
   Run the system scanner to inspect existing boundaries and dependencies:
   ```bash
   bun scripts/system-xray.ts .
   ```

2. **Type Contracts First**
   Never design in abstract prose. Specify complete TypeScript interface definitions, domain error unions, and input schemas before explaining logic.

3. **Trade-Off Matrix**
   Every proposed design must compare at least two alternatives across:
   - Implementation complexity.
   - Blast-radius and migration cost.
   - Operational overhead and query performance.

4. **Zero Em-Dash Rule**
   Do not use em-dashes anywhere in RFC text or specifications.

## RFC Template Structure

1. **Context & Motivation**: Why is this change necessary?
2. **Goals & Non-Goals**: Clear boundaries of the design scope.
3. **Formal Specification**:
   - TypeScript Types & Interfaces.
   - Database Entities & Migrations.
   - Event Channels & Payloads.
4. **Blast-Radius & Affected Workspaces**:
   - Impacted packages identified via `diff-digest.ts`.
5. **Rollback & Migration Plan**: Step-by-step zero-downtime execution.
